# 🚀 Руководство по развертыванию BusinessUnion

Это руководство описывает процесс развертывания приложения BusinessUnion на сервере с использованием Docker.

## 📋 Требования

- Сервер с установленным Docker (версия 20.10+)
- Docker Compose (версия 2.0+)
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске
- Открытые порты: 80 (HTTP), 3001 (API), 3306 (MySQL)

## 🛠️ Установка Docker на сервере

### Ubuntu/Debian

```bash
# Обновляем пакеты
sudo apt-get update

# Устанавливаем необходимые пакеты
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Добавляем официальный GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Проверяем установку
docker --version
docker compose version
```

### CentOS/RHEL

```bash
# Устанавливаем необходимые утилиты
sudo yum install -y yum-utils

# Добавляем репозиторий Docker
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Устанавливаем Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Запускаем Docker
sudo systemctl start docker
sudo systemctl enable docker

# Проверяем установку
docker --version
docker compose version
```

## 📦 Развертывание приложения

### 1. Клонирование репозитория

```bash
# Клонируем репозиторий на сервер
git clone <your-repository-url> businessunion
cd businessunion

# Переключаемся на нужную ветку (если требуется)
git checkout beta1.4
```

### 2. Настройка переменных окружения

```bash
# Копируем пример файла с переменными окружения
cp .env.example .env

# Редактируем файл .env
nano .env
```

**Обязательно измените следующие параметры:**

```env
# Безопасные пароли для базы данных
DB_ROOT_PASSWORD=your_strong_root_password
DB_PASS=your_strong_database_password

# Секретный ключ для JWT (используйте случайную строку)
JWT_SECRET=your_very_long_random_secret_key_here

# URL фронтенда (домен вашего сервера)
FRONTEND_URL=http://your-domain.com

# OpenAI API ключ (если используете AI функции)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 3. Запуск приложения

```bash
# Сборка и запуск всех контейнеров (автоматически в production режиме)
docker compose up -d --build

# Проверяем статус контейнеров
docker compose ps

# Смотрим логи (опционально)
docker compose logs -f
```

**Примечание:** Docker Compose файл уже настроен для production использования с:
- Автоматическим перезапуском контейнеров
- Ограничением ресурсов
- Логированием с ротацией
- Health checks для всех сервисов
- Оптимизированными настройками MySQL

Приложение будет доступно по адресу: `http://your-server-ip`

### 4. Проверка работоспособности

```bash
# Проверяем запущенные контейнеры
docker compose ps

# Должны быть запущены 3 контейнера:
# - businessunion-mysql (база данных)
# - businessunion-backend (API сервер)
# - businessunion-frontend (веб-интерфейс)

# Проверяем логи backend
docker compose logs backend

# Проверяем логи frontend
docker compose logs frontend

# Проверяем логи базы данных
docker compose logs mysql
```

## 🔧 Управление приложением

### Остановка приложения

```bash
docker compose stop
```

### Запуск остановленного приложения

```bash
docker compose start
```

### Перезапуск приложения

```bash
docker compose restart
```

### Полная остановка и удаление контейнеров

```bash
docker compose down
```

### Остановка с удалением volumes (⚠️ удалит все данные!)

```bash
docker compose down -v
```

## 📊 Логи и отладка

### Просмотр логов всех сервисов

```bash
docker compose logs -f
```

### Просмотр логов конкретного сервиса

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### Доступ к контейнеру

```bash
# Backend
docker exec -it businessunion-backend sh

# База данных
docker exec -it businessunion-mysql mysql -u root -p

# Frontend
docker exec -it businessunion-frontend sh
```

## 🔄 Обновление приложения

```bash
# Останавливаем контейнеры
docker compose down

# Получаем последние изменения из репозитория
git pull origin beta1.4

# Пересобираем и запускаем контейнеры
docker compose up -d --build

# Применяем миграции (если есть новые)
docker exec businessunion-backend npm run migration:run
```

## 💾 Резервное копирование

### Создание резервной копии базы данных

```bash
# Создаем backup
docker exec businessunion-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} businessunion > backup_$(date +%Y%m%d_%H%M%S).sql

# Или с использованием переменных из .env
source .env
docker exec businessunion-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из резервной копии

```bash
# Восстанавливаем из backup
docker exec -i businessunion-mysql mysql -u root -p${DB_ROOT_PASSWORD} businessunion < backup_20231207_120000.sql
```

### Резервное копирование файлов (uploads)

```bash
# Создаем архив с загруженными файлами
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```

## 🔒 Настройка HTTPS (SSL)

Для продакшн окружения рекомендуется использовать HTTPS. Можно использовать Nginx или Traefik в качестве reverse proxy с Let's Encrypt.

### Вариант 1: Использование Nginx на хосте

```bash
# Устанавливаем Nginx и Certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Получаем SSL сертификат
sudo certbot --nginx -d your-domain.com

# Nginx автоматически настроит проксирование на порт 80
```

### Вариант 2: Добавление Nginx в docker-compose.yml

Создайте файл `nginx-ssl.conf` и добавьте Nginx сервис в `docker-compose.yml`.

## 🔍 Устранение неполадок

### Проблема: Контейнер не запускается

```bash
# Смотрим подробные логи
docker compose logs backend
docker compose logs mysql

# Проверяем конфигурацию
docker compose config
```

### Проблема: База данных недоступна

```bash
# Проверяем здоровье контейнера
docker compose ps

# Проверяем подключение к MySQL
docker exec -it businessunion-mysql mysql -u root -p

# Перезапускаем контейнер БД
docker compose restart mysql
```

### Проблема: Фронтенд не может подключиться к API

Проверьте настройки в `.env`:
- `FRONTEND_URL` должен соответствовать домену/IP сервера
- Убедитесь, что порт 3001 открыт или настроен reverse proxy

## 📈 Мониторинг

### Использование ресурсов

```bash
# Смотрим использование ресурсов контейнерами
docker stats
```

### Проверка доступности

```bash
# Проверяем API
curl http://localhost:3001/api

# Проверяем фронтенд
curl http://localhost
```

## 🎯 Production рекомендации

1. **Безопасность:**
   - Используйте сильные пароли
   - Регулярно обновляйте зависимости
   - Настройте firewall (UFW, iptables)
   - Используйте HTTPS
   - Ограничьте доступ к портам MySQL (3306) и API (3001)

2. **Производительность:**
   - Настройте параметры MySQL для вашей нагрузки
   - Используйте Nginx для кэширования статики
   - Настройте логирование только критичных ошибок

3. **Резервное копирование:**
   - Настройте автоматическое резервное копирование БД (cron)
   - Храните резервные копии в отдельном месте
   - Регулярно проверяйте возможность восстановления

4. **Мониторинг:**
   - Настройте мониторинг доступности (UptimeRobot, Pingdom)
   - Мониторьте использование ресурсов
   - Настройте алерты для критичных ошибок

## 📞 Поддержка

Если возникли проблемы при развертывании:
1. Проверьте логи: `docker compose logs`
2. Убедитесь, что все порты доступны
3. Проверьте переменные окружения в `.env`
4. Обратитесь к документации Docker: https://docs.docker.com/

---

**Версия:** 1.0  
**Последнее обновление:** Декабрь 2023

