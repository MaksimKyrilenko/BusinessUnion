# 📋 Полезные команды для управления BusinessUnion

## 🚀 Быстрый старт

### Развертывание (первый раз)
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat

# Или через Makefile
make init
make build
make up
```

### Обычный запуск
```bash
docker compose up -d
# или
make up
```

---

## 🎯 Основные команды

### Makefile команды (рекомендуется)

```bash
make help              # Показать все доступные команды
make build             # Собрать Docker образы
make up                # Запустить все сервисы
make down              # Остановить все сервисы
make restart           # Перезапустить все сервисы
make logs              # Показать логи всех сервисов
make logs-backend      # Показать логи backend
make logs-frontend     # Показать логи frontend
make ps                # Показать статус контейнеров
make backup            # Создать backup БД
make backup-uploads    # Создать backup файлов
make status            # Показать подробный статус
make update            # Обновить приложение из git
make clean             # Очистить неиспользуемые Docker ресурсы
```

### Docker Compose команды

```bash
# Сборка
docker compose build                    # Собрать образы
docker compose build --no-cache         # Собрать без кэша

# Запуск
docker compose up                       # Запустить (foreground)
docker compose up -d                    # Запустить (background)
docker compose up -d --build            # Собрать и запустить

# Остановка
docker compose stop                     # Остановить контейнеры
docker compose down                     # Остановить и удалить контейнеры
docker compose down -v                  # + удалить volumes (⚠️ удалит данные!)

# Перезапуск
docker compose restart                  # Перезапустить все
docker compose restart backend          # Перезапустить backend
docker compose restart frontend         # Перезапустить frontend
docker compose restart mysql            # Перезапустить БД

# Статус
docker compose ps                       # Статус контейнеров
docker compose ps -a                    # Все контейнеры
docker compose top                      # Процессы в контейнерах

# Логи
docker compose logs                     # Все логи
docker compose logs -f                  # Логи в реальном времени
docker compose logs -f backend          # Логи backend
docker compose logs -f --tail=100       # Последние 100 строк
docker compose logs --since 30m         # Логи за последние 30 минут
```

---

## 🔧 Доступ к контейнерам

### Shell доступ

```bash
# Backend контейнер
docker exec -it businessunion-backend sh
make shell-backend

# Frontend контейнер
docker exec -it businessunion-frontend sh

# MySQL контейнер
docker exec -it businessunion-mysql bash
```

### MySQL доступ

```bash
# MySQL shell
docker exec -it businessunion-mysql mysql -u root -p
make shell-db

# Выполнить SQL запрос
docker exec businessunion-mysql mysql -u root -pПАРОЛЬ businessunion -e "SELECT COUNT(*) FROM users;"

# Экспорт базы
docker exec businessunion-mysql mysqldump -u root -pПАРОЛЬ businessunion > backup.sql

# Импорт базы
docker exec -i businessunion-mysql mysql -u root -pПАРОЛЬ businessunion < backup.sql
```

---

## 💾 Резервное копирование

### Автоматические скрипты

```bash
# Backup базы данных
./scripts/backup.sh

# Восстановление из backup
./scripts/restore.sh /path/to/backup.sql.gz

# Или через Makefile
make backup
make backup-uploads
```

### Ручное резервное копирование

```bash
# База данных
docker exec businessunion-mysql mysqldump \
  -u root -p \
  --single-transaction \
  businessunion > backup_$(date +%Y%m%d).sql

# Сжать backup
gzip backup_$(date +%Y%m%d).sql

# Файлы uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Весь проект (без node_modules)
tar -czf full_backup_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  .
```

### Автоматизация через cron

```bash
# Редактируем crontab
crontab -e

# Добавляем задачи:
# Backup каждый день в 2:00
0 2 * * * cd /opt/businessunion && ./scripts/backup.sh >> /var/log/businessunion-backup.log 2>&1

# Очистка старых логов каждую неделю
0 3 * * 0 find /opt/backups/businessunion -name "*.gz" -mtime +30 -delete
```

---

## 📊 Мониторинг

### Скрипт мониторинга

```bash
# Запустить монитор
./scripts/monitor.sh

# Или watch для обновления
watch -n 5 ./scripts/monitor.sh
```

### Использование ресурсов

```bash
# Реальное использование ресурсов
docker stats

# Использование без потока (snapshot)
docker stats --no-stream

# Конкретный контейнер
docker stats businessunion-backend

# Disk usage
docker system df
docker system df -v  # подробно
```

### Проверка здоровья

```bash
# Проверить статус всех контейнеров
docker compose ps

# Проверить логи на ошибки
docker compose logs | grep -i error

# Проверить доступность frontend
curl -I http://localhost

# Проверить доступность API
curl http://localhost:3001/api

# Проверить MySQL
docker exec businessunion-mysql mysqladmin ping -h localhost
```

---

## 🔄 Обновление приложения

### Стандартное обновление

```bash
# 1. Получаем последние изменения
git pull origin beta1.4

# 2. Останавливаем контейнеры
docker compose down

# 3. Пересобираем и запускаем
docker compose up -d --build

# 4. Проверяем логи
docker compose logs -f

# Или одной командой
make update
```

### Обновление с миграциями

```bash
# 1. Создаем backup
make backup

# 2. Обновляем код
git pull origin beta1.4

# 3. Пересобираем backend
docker compose build backend

# 4. Запускаем миграции
docker exec businessunion-backend npm run migration:run

# 5. Перезапускаем
docker compose restart backend
```

### Откат к предыдущей версии

```bash
# 1. Останавливаем
docker compose down

# 2. Откатываем код
git checkout <previous-commit-hash>

# 3. Восстанавливаем БД (если нужно)
./scripts/restore.sh /path/to/backup.sql.gz

# 4. Запускаем
docker compose up -d --build
```

---

## 🧹 Очистка

### Очистка Docker

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Удалить неиспользуемые networks
docker network prune

# Полная очистка системы
docker system prune -a --volumes

# Через Makefile
make clean
```

### Очистка логов

```bash
# Очистить логи Docker
truncate -s 0 $(docker inspect --format='{{.LogPath}}' businessunion-backend)

# Или для всех контейнеров
docker compose ps -q | xargs -I {} sh -c 'truncate -s 0 $(docker inspect --format="{{.LogPath}}" {})'
```

---

## 🔍 Отладка и устранение проблем

### Просмотр логов

```bash
# Все логи с timestamp
docker compose logs -f -t

# Последние N строк
docker compose logs --tail=50

# Логи за период
docker compose logs --since 2023-12-01
docker compose logs --since 30m  # последние 30 минут

# Поиск в логах
docker compose logs | grep "error"
docker compose logs backend | grep "database"
```

### Проверка конфигурации

```bash
# Проверить docker-compose.yml
docker compose config

# Проверить переменные окружения
docker compose config | grep -A 10 environment

# Проверить volumes
docker volume ls
docker volume inspect businessunion_mysql_data
```

### Проблемы с портами

```bash
# Проверить занятые порты (Linux)
sudo lsof -i :80
sudo lsof -i :3001
sudo lsof -i :3306

# Windows
netstat -ano | findstr :80
netstat -ano | findstr :3001
```

### Проблемы с БД

```bash
# Проверить подключение
docker exec businessunion-mysql mysqladmin ping

# Проверить таблицы
docker exec businessunion-mysql mysql -u root -p -e "USE businessunion; SHOW TABLES;"

# Проверить размер БД
docker exec businessunion-mysql mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'businessunion';"

# Пересоздать контейнер БД (⚠️ данные сохранятся в volume)
docker compose stop mysql
docker compose rm -f mysql
docker compose up -d mysql
```

### Полный сброс (⚠️ удалит все данные!)

```bash
# 1. Останавливаем и удаляем всё
docker compose down -v

# 2. Удаляем образы
docker rmi businessunion-backend businessunion-frontend

# 3. Заново собираем
docker compose up -d --build
```

---

## 📈 Production команды

### Запуск в production режиме

```bash
# Docker compose файл уже настроен для production
docker compose up -d --build

# Или через Makefile
make up
```

### Масштабирование

```bash
# Запустить несколько инстансов backend
docker compose up -d --scale backend=3

# С Nginx load balancer потребуется дополнительная настройка
```

### Health checks

```bash
# Добавьте в docker-compose.yml для каждого сервиса:
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/api"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🔐 Безопасность

### Обновление паролей

```bash
# 1. Отредактируйте .env
nano .env

# 2. Пересоздайте контейнер БД
docker compose down mysql
docker volume rm businessunion_mysql_data  # ⚠️ Удалит данные!
docker compose up -d mysql
```

### Проверка безопасности

```bash
# Проверить открытые порты
docker compose ps --services | xargs -I {} docker port businessunion-{}

# Проверить volumes
docker volume ls --filter "name=businessunion"

# Проверить networks
docker network inspect businessunion_businessunion-network
```

---

## 📞 Дополнительные ресурсы

- **Полное руководство:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Быстрый старт (RU):** [QUICK_START_RU.md](QUICK_START_RU.md)
- **Тестирование:** [TESTING.md](TESTING.md)
- **Docker документация:** https://docs.docker.com/
- **Docker Compose CLI:** https://docs.docker.com/compose/reference/

---

💡 **Совет:** Используйте `make help` для быстрого доступа к часто используемым командам!

