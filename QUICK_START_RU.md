# 🚀 Быстрый старт - Развертывание на сервере

## Пошаговая инструкция для развертывания BusinessUnion

### Шаг 1: Подготовка сервера

Подключитесь к вашему серверу по SSH:
```bash
ssh root@your-server-ip
```

### Шаг 2: Установка Docker (Ubuntu/Debian)

```bash
# Обновляем систему
sudo apt-get update && sudo apt-get upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Проверяем установку
docker --version
docker compose version
```

### Шаг 3: Клонирование проекта

```bash
# Устанавливаем git (если не установлен)
sudo apt-get install -y git

# Клонируем репозиторий
cd /opt
git clone <YOUR_REPOSITORY_URL> businessunion
cd businessunion

# Переключаемся на нужную ветку
git checkout beta1.4
```

### Шаг 4: Настройка переменных окружения

```bash
# Копируем пример конфигурации
cp env.example .env

# Редактируем конфигурацию
nano .env
```

**Обязательно измените следующие параметры:**

```env
# Сильные пароли для базы данных
DB_ROOT_PASSWORD=ваш_супер_секретный_пароль_root
DB_PASS=ваш_супер_секретный_пароль_пользователя

# Случайная строка для JWT (минимум 32 символа)
JWT_SECRET=ваша_очень_длинная_и_случайная_секретная_строка_для_jwt_токенов

# URL вашего сайта (важно!)
FRONTEND_URL=http://ваш-домен.com

# OpenAI API ключ (если планируете использовать AI функции)
OPENAI_API_KEY=sk-ваш-ключ-openai
```

**Сохраните файл:** `Ctrl + X`, затем `Y`, затем `Enter`

### Шаг 5: Запуск приложения

#### Вариант A: Используя скрипт (рекомендуется)

```bash
# Делаем скрипт исполняемым
chmod +x deploy.sh

# Запускаем развертывание
./deploy.sh
```

#### Вариант B: Вручную

```bash
# Создаем необходимые директории
mkdir -p backend/uploads/avatars
mkdir -p backend/uploads/images
mkdir -p backend/uploads/files

# Собираем и запускаем контейнеры
docker compose up -d --build

# Проверяем статус
docker compose ps

# Смотрим логи
docker compose logs -f
```

### Шаг 6: Проверка работоспособности

```bash
# Проверяем, что все контейнеры запущены
docker compose ps

# Должно быть 3 контейнера в статусе "Up":
# - businessunion-mysql
# - businessunion-backend
# - businessunion-frontend

# Проверяем логи backend
docker compose logs backend | tail -20

# Проверяем логи frontend
docker compose logs frontend | tail -20
```

### Шаг 7: Настройка Firewall

```bash
# Разрешаем HTTP трафик
sudo ufw allow 80/tcp

# Разрешаем HTTPS (если будете настраивать SSL)
sudo ufw allow 443/tcp

# Включаем firewall (если не включен)
sudo ufw enable

# Проверяем статус
sudo ufw status
```

### Шаг 8: Доступ к приложению

Откройте в браузере:
- **Сайт:** `http://ваш-server-ip` или `http://ваш-домен.com`
- **API документация:** `http://ваш-server-ip:3001/api`

---

## 🎯 Настройка домена (опционально)

Если у вас есть домен, настройте DNS записи:

### A-запись в DNS
```
Тип: A
Имя: @
Значение: IP_вашего_сервера
TTL: 3600
```

### WWW поддомен (опционально)
```
Тип: CNAME
Имя: www
Значение: ваш-домен.com
TTL: 3600
```

---

## 🔒 Настройка HTTPS с Let's Encrypt

### Установка Certbot

```bash
# Устанавливаем Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Останавливаем контейнеры
cd /opt/businessunion
docker compose down

# Устанавливаем Nginx на хост (для получения сертификата)
sudo apt-get install -y nginx

# Получаем SSL сертификат
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Настраиваем nginx для проксирования на Docker
sudo nano /etc/nginx/sites-available/businessunion
```

Добавьте конфигурацию:
```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ваш-домен.com www.ваш-домен.com;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Создаем символическую ссылку
sudo ln -s /etc/nginx/sites-available/businessunion /etc/nginx/sites-enabled/

# Удаляем дефолтный конфиг
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем nginx
sudo systemctl restart nginx

# Запускаем Docker контейнеры на другом порту
cd /opt/businessunion
# Измените FRONTEND_PORT в .env на 8080
docker compose up -d
```

---

## 📊 Управление приложением

### Просмотр логов
```bash
cd /opt/businessunion

# Все логи
docker compose logs -f

# Только backend
docker compose logs -f backend

# Только frontend
docker compose logs -f frontend

# Последние 100 строк
docker compose logs --tail=100
```

### Перезапуск
```bash
cd /opt/businessunion

# Перезапустить все
docker compose restart

# Перезапустить backend
docker compose restart backend
```

### Остановка
```bash
cd /opt/businessunion

# Остановить
docker compose stop

# Остановить и удалить контейнеры (данные сохранятся)
docker compose down
```

### Обновление приложения
```bash
cd /opt/businessunion

# Получаем обновления
git pull origin beta1.4

# Останавливаем и пересобираем
docker compose down
docker compose up -d --build

# Смотрим логи
docker compose logs -f
```

---

## 🛟 Резервное копирование

### Создание backup базы данных
```bash
cd /opt/businessunion

# Создаем backup
docker exec businessunion-mysql mysqldump \
  -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) \
  businessunion > backup_$(date +%Y%m%d_%H%M%S).sql

# Или просто
docker exec businessunion-mysql mysqldump -u root -prootpassword businessunion > backup.sql
```

### Восстановление из backup
```bash
docker exec -i businessunion-mysql mysql \
  -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) \
  businessunion < backup_20231207_120000.sql
```

### Backup файлов (uploads)
```bash
cd /opt/businessunion
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Автоматическое резервное копирование (cron)
```bash
# Открываем crontab
crontab -e

# Добавляем задачу (каждый день в 2:00)
0 2 * * * cd /opt/businessunion && docker exec businessunion-mysql mysqldump -u root -pВАШ_ПАРОЛЬ businessunion > /opt/backups/businessunion_$(date +\%Y\%m\%d).sql
```

---

## 🔍 Решение проблем

### Контейнер не запускается
```bash
# Смотрим логи
docker compose logs backend

# Проверяем конфигурацию
docker compose config

# Пересоздаем контейнер
docker compose down
docker compose up -d --force-recreate backend
```

### База данных недоступна
```bash
# Проверяем статус MySQL
docker compose ps mysql

# Заходим в MySQL
docker exec -it businessunion-mysql mysql -u root -p

# Перезапускаем MySQL
docker compose restart mysql
```

### Нет места на диске
```bash
# Очищаем неиспользуемые Docker образы
docker system prune -a

# Проверяем место
df -h
```

### Порты заняты
```bash
# Проверяем, что использует порт 80
sudo lsof -i :80

# Проверяем, что использует порт 3001
sudo lsof -i :3001

# Останавливаем процесс (замените PID на реальный)
sudo kill -9 PID
```

---

## 📞 Получение помощи

1. Проверьте логи: `docker compose logs -f`
2. Читайте полную документацию: `DEPLOYMENT.md`
3. Проверьте GitHub Issues
4. Обратитесь в поддержку

---

## ✅ Чек-лист после установки

- [ ] Все 3 контейнера запущены (`docker compose ps`)
- [ ] Сайт открывается в браузере
- [ ] API документация доступна на /api
- [ ] Можно зарегистрироваться и войти
- [ ] Изменены все пароли в `.env`
- [ ] Настроен firewall
- [ ] Настроено резервное копирование
- [ ] (Опционально) Настроен SSL/HTTPS
- [ ] (Опционально) Настроен мониторинг

---

**Поздравляем! Ваше приложение BusinessUnion успешно развернуто! 🎉**

