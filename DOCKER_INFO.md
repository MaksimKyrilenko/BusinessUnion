# 🐳 Docker конфигурация BusinessUnion

## Обзор архитектуры

Приложение состоит из 3 основных сервисов:

```
┌─────────────────────────────────────────┐
│         Frontend (Nginx + Vue.js)       │
│              Port: 80                   │
│         businessunion-frontend          │
└─────────────┬───────────────────────────┘
              │
              ├──> API Proxy: /api → backend:3001
              ├──> Uploads Proxy: /uploads → backend:3001
              │
┌─────────────▼───────────────────────────┐
│         Backend (NestJS)                │
│              Port: 3001                 │
│         businessunion-backend           │
└─────────────┬───────────────────────────┘
              │
              │ TypeORM Connection
              │
┌─────────────▼───────────────────────────┐
│         Database (MySQL 8.0)            │
│              Port: 3306                 │
│         businessunion-mysql             │
└─────────────────────────────────────────┘

Network: businessunion-network (bridge)
Volume: mysql_data (persistent storage)
Volume: ./backend/uploads (bind mount)
```

## Структура файлов

```
BusinessUnion/
├── docker-compose.yml           # Главный файл оркестрации
├── .dockerignore               # Исключения для Docker
├── env.example                 # Шаблон переменных окружения
│
├── backend/
│   ├── Dockerfile              # Backend образ (Node.js 18)
│   ├── .dockerignore           # Backend исключения
│   └── src/database/
│       └── init.sql            # Инициализация БД
│
└── frontend/
    ├── Dockerfile              # Frontend образ (Node.js + Nginx)
    ├── .dockerignore           # Frontend исключения
    └── nginx.conf              # Nginx конфигурация
```

## Описание сервисов

### 🗄️ MySQL (mysql)

**Образ:** `mysql:8.0`  
**Контейнер:** `businessunion-mysql`  
**Порт:** `3306` (настраивается через `${DB_PORT}`)

**Характеристики:**
- Кодировка: UTF-8 (utf8mb4)
- Max connections: 1000
- InnoDB buffer pool: 1GB
- Persistent storage через volume `mysql_data`
- Health check каждые 10 секунд
- Автоматическая инициализация через init.sql

**Переменные окружения:**
- `MYSQL_ROOT_PASSWORD` - пароль root
- `MYSQL_DATABASE` - имя базы данных
- `MYSQL_USER` - пользователь БД
- `MYSQL_PASSWORD` - пароль пользователя

**Ресурсы:**
- Без явных ограничений (управляется MySQL настройками)

### 🔧 Backend (backend)

**Базовый образ:** `node:18-alpine`  
**Контейнер:** `businessunion-backend`  
**Порт:** `3001`

**Характеристики:**
- Multi-stage build (оптимизация размера)
- Запуск от непривилегированного пользователя
- Автоматический запуск миграций при старте
- Health check на `/api` endpoint
- Bind mount для uploads директории

**Переменные окружения:**
- `NODE_ENV=production`
- `DB_HOST=mysql`
- `DB_PORT=3306`
- `DB_USER` - пользователь БД
- `DB_PASS` - пароль БД
- `DB_NAME` - имя БД
- `JWT_SECRET` - секрет для JWT токенов
- `FRONTEND_URL` - URL фронтенда
- `OPENAI_API_KEY` - ключ OpenAI (опционально)

**Ресурсы:**
- Limit: 1 CPU, 1GB RAM
- Reservation: 0.5 CPU, 512MB RAM

**Логирование:**
- Driver: json-file
- Max size: 10MB
- Max files: 3

### 🌐 Frontend (frontend)

**Базовый образ:** `nginx:alpine`  
**Контейнер:** `businessunion-frontend`  
**Порт:** `80` (настраивается через `${FRONTEND_PORT}`)

**Характеристики:**
- Multi-stage build (сборка Vue.js + Nginx)
- SPA routing support
- Gzip compression
- Static files caching
- API proxy к backend
- Health check на главную страницу

**Ресурсы:**
- Limit: 0.5 CPU, 512MB RAM
- Reservation: 0.25 CPU, 256MB RAM

**Логирование:**
- Driver: json-file
- Max size: 10MB
- Max files: 3

## Volumes

### mysql_data
- **Тип:** Named volume
- **Назначение:** Постоянное хранилище данных MySQL
- **Локация:** Docker managed volume
- **Backup:** Через mysqldump

### ./backend/uploads
- **Тип:** Bind mount
- **Назначение:** Загруженные файлы (аватары, изображения, документы)
- **Локация:** Host filesystem
- **Backup:** Через tar/rsync

## Network

**Имя:** `businessunion-network`  
**Driver:** bridge  
**Изоляция:** Контейнеры изолированы от внешней сети, общаются между собой по именам сервисов

## Production готовность

### ✅ Что уже настроено

1. **Автоматический перезапуск**
   - `restart: always` для всех сервисов

2. **Health Checks**
   - MySQL: ping проверка
   - Backend: HTTP GET /api
   - Frontend: HTTP GET /

3. **Ограничение ресурсов**
   - CPU и RAM limits для backend/frontend
   - Предотвращение overconsumption

4. **Логирование с ротацией**
   - Максимум 10MB на файл
   - Хранение последних 3 файлов
   - Автоматическая очистка старых логов

5. **Оптимизация MySQL**
   - UTF-8 по умолчанию
   - Увеличенный connection pool
   - Оптимизированный buffer pool

6. **Безопасность**
   - Непривилегированный пользователь в backend
   - Переменные окружения для secrets
   - Изолированная сеть

### 🔧 Рекомендуемые улучшения для production

1. **Reverse Proxy (Nginx/Traefik)**
   ```yaml
   # Добавить nginx-proxy для SSL
   nginx-proxy:
     image: jwilder/nginx-proxy
     ports:
       - "80:80"
       - "443:443"
   ```

2. **SSL сертификаты (Let's Encrypt)**
   ```yaml
   letsencrypt:
     image: jrcs/letsencrypt-nginx-proxy-companion
   ```

3. **Мониторинг**
   ```yaml
   # Prometheus + Grafana
   prometheus:
     image: prom/prometheus
   grafana:
     image: grafana/grafana
   ```

4. **Резервное копирование**
   - Настроить cron для автоматических бэкапов
   - Использовать scripts/backup.sh

5. **Secrets Management**
   - Использовать Docker Secrets
   - Или внешний secrets manager (Vault)

## Переменные окружения

### Обязательные для изменения

```env
DB_ROOT_PASSWORD=your_strong_password
DB_PASS=your_db_password
JWT_SECRET=your_very_long_random_secret_key
FRONTEND_URL=https://your-domain.com
```

### Опциональные

```env
DB_NAME=businessunion
DB_USER=businessuser
DB_PORT=3306
DB_LOGGING=false
FRONTEND_PORT=80
OPENAI_API_KEY=sk-...
VUE_APP_API_URL=http://localhost:3001
```

## Порты

| Сервис   | Внутренний | Внешний     | Описание              |
|----------|-----------|-------------|-----------------------|
| frontend | 80        | 80 (custom) | HTTP веб-сервер       |
| backend  | 3001      | 3001        | API сервер            |
| mysql    | 3306      | 3306 (custom)| База данных          |

**Примечание:** Внешние порты можно изменить через переменные окружения

## Команды управления

### Основные команды

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Логи
docker compose logs -f

# Статус
docker compose ps
```

### Управление отдельными сервисами

```bash
# Перезапустить backend
docker compose restart backend

# Логи только MySQL
docker compose logs -f mysql

# Пересобрать frontend
docker compose up -d --build frontend
```

### Отладка

```bash
# Shell в backend
docker exec -it businessunion-backend sh

# MySQL консоль
docker exec -it businessunion-mysql mysql -u root -p

# Проверка health status
docker inspect businessunion-backend | grep -A 10 Health
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker compose logs service_name

# Проверить конфигурацию
docker compose config

# Пересоздать контейнер
docker compose up -d --force-recreate service_name
```

### Проблемы с БД

```bash
# Проверить health
docker compose ps mysql

# Проверить подключение
docker exec businessunion-mysql mysqladmin ping

# Перезапустить БД
docker compose restart mysql
```

### Проблемы с памятью

```bash
# Проверить использование
docker stats

# Увеличить лимиты в docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G  # было 1G
```

### Очистка места

```bash
# Удалить неиспользуемые образы
docker system prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (⚠️ осторожно!)
docker system prune -a --volumes
```

## Безопасность

### Checklist

- [ ] Изменены все пароли в .env
- [ ] JWT_SECRET использует сильный случайный ключ
- [ ] Порты MySQL и Backend закрыты firewall (только 80/443 открыты)
- [ ] Используется HTTPS (через reverse proxy)
- [ ] Регулярные обновления образов
- [ ] Настроено резервное копирование
- [ ] Логи мониторятся на подозрительную активность

### Обновление образов

```bash
# Проверить обновления
docker compose pull

# Применить обновления
docker compose up -d --build
```

## Performance туning

### MySQL

Отредактируйте docker-compose.yml:
```yaml
command:
  - --max_connections=2000              # Больше соединений
  - --innodb_buffer_pool_size=2G        # Больше кэша
  - --innodb_log_file_size=512M         # Больше лог файлы
  - --query_cache_size=128M             # Query кэш
```

### Backend

Увеличьте ресурсы:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

### Масштабирование

```bash
# Запустить несколько инстансов backend
docker compose up -d --scale backend=3

# Требует настройки load balancer
```

## Мониторинг

### Логи

```bash
# Реал-тайм логи
docker compose logs -f

# Последние N строк
docker compose logs --tail=100

# За период времени
docker compose logs --since 30m
```

### Метрики

```bash
# CPU и RAM
docker stats

# Disk usage
docker system df
```

### Alerts

Настройте мониторинг через:
- Prometheus + Grafana
- UptimeRobot
- DataDog
- NewRelic

## Дополнительная информация

- **Полное руководство:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Команды:** [COMMANDS.md](COMMANDS.md)
- **Быстрый старт:** [QUICK_START_RU.md](QUICK_START_RU.md)
- **Docker Docs:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/

---

Версия: 1.0  
Последнее обновление: Декабрь 2024


