# BusinessUnion

Платформа для бизнес-коммуникаций и управления проектами с интегрированными модулями для финансовой аналитики, криптотрекинга, образования и сообществ.

## 🚀 Быстрый старт с Docker

### Предварительные требования

- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске

### Установка и запуск

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url> businessunion
cd businessunion
```

2. **Создайте файл с переменными окружения:**
```bash
cp env.example .env
```

3. **Отредактируйте `.env` файл:**
```bash
nano .env
```

**Обязательно измените:**
- `DB_ROOT_PASSWORD` - пароль root для MySQL
- `DB_PASS` - пароль пользователя БД
- `JWT_SECRET` - секретный ключ для JWT токенов
- `FRONTEND_URL` - URL вашего домена
- `OPENAI_API_KEY` - ваш API ключ OpenAI (опционально)

4. **Запустите приложение:**
```bash
docker compose up -d --build
```

5. **Проверьте статус:**
```bash
docker compose ps
docker compose logs -f
```

Приложение будет доступно по адресу: `http://localhost`  
API документация (Swagger): `http://localhost:3001/api`

## 📦 Структура проекта

```
BusinessUnion/
├── backend/              # NestJS API сервер
│   ├── src/
│   │   ├── auth/        # Аутентификация и авторизация
│   │   ├── users/       # Управление пользователями
│   │   ├── communities/ # Сообщества
│   │   ├── projects/    # Управление проектами
│   │   ├── crypto-tracker/     # Отслеживание криптовалют
│   │   ├── financial-analytics/ # Финансовая аналитика
│   │   ├── education/   # Образовательные материалы
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Vue.js приложение
│   ├── src/
│   │   ├── components/ # Vue компоненты
│   │   ├── views/      # Страницы приложения
│   │   ├── services/   # API сервисы
│   │   ├── stores/     # Pinia хранилища
│   │   └── router/     # Vue Router конфигурация
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml   # Docker оркестрация
├── env.example          # Пример переменных окружения
└── DEPLOYMENT.md        # Подробное руководство по развертыванию
```

## 🛠️ Разработка

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

Backend будет доступен на `http://localhost:3001`

### Frontend (Vue.js)

```bash
cd frontend
npm install
npm run serve
```

Frontend будет доступен на `http://localhost:8081`

### База данных

По умолчанию используется MySQL. Настройки подключения в `backend/src/data-source.ts`

## 🔧 Управление Docker контейнерами

### Просмотр логов
```bash
docker compose logs -f           # Все сервисы
docker compose logs -f backend   # Только backend
docker compose logs -f frontend  # Только frontend
docker compose logs -f mysql     # Только база данных
```

### Остановка
```bash
docker compose stop              # Остановить без удаления
docker compose down              # Остановить и удалить контейнеры
```

### Перезапуск
```bash
docker compose restart           # Перезапустить все сервисы
docker compose restart backend   # Перезапустить только backend
```

### Обновление приложения
```bash
git pull origin main
docker compose down
docker compose up -d --build
```

## 💾 Резервное копирование

### База данных
```bash
# Создать backup
docker exec businessunion-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} businessunion > backup.sql

# Восстановить из backup
docker exec -i businessunion-mysql mysql -u root -p${DB_ROOT_PASSWORD} businessunion < backup.sql
```

### Файлы (uploads)
```bash
tar -czf uploads_backup.tar.gz backend/uploads/
```

## 📚 Модули платформы

- **👥 Управление пользователями** - регистрация, профили, роли
- **💬 Чат и сообщения** - внутренняя коммуникация
- **🏢 Сообщества** - создание и управление бизнес-сообществами
- **📊 Проекты** - управление проектами и задачами
- **💰 Криптотрекинг** - отслеживание криптовалют и портфолио
- **📈 Финансовая аналитика** - анализ финансовых показателей
- **🎓 Образование** - образовательные материалы и курсы
- **📅 События** - планирование и управление событиями
- **💼 Инвестиции** - отслеживание инвестиций

## 🔒 Безопасность

- JWT аутентификация
- Bcrypt хеширование паролей
- CORS защита
- Валидация входных данных
- Защита от SQL инъекций через TypeORM

## 📖 Документация

- [DEPLOYMENT.md](DEPLOYMENT.md) - Подробное руководство по развертыванию
- [TESTING.md](TESTING.md) - Руководство по тестированию
- [CRYPTO_TRACKER_INTEGRATION.md](CRYPTO_TRACKER_INTEGRATION.md) - Интеграция криптотрекинга
- [COMMUNITIES_SETUP.md](COMMUNITIES_SETUP.md) - Настройка сообществ
- [BUSINESS_ANALYTICS_SETUP.md](BUSINESS_ANALYTICS_SETUP.md) - Настройка бизнес-аналитики

API документация доступна по адресу: `http://localhost:3001/api` после запуска приложения.

## 🧪 Тестирование

```bash
# Функциональные тесты
npm run test:functional

# Тесты производительности
npm run test:performance
```

## 🤝 Технологический стек

### Backend
- **Framework:** NestJS
- **Database:** MySQL + TypeORM
- **Authentication:** JWT + Bcrypt
- **API Documentation:** Swagger
- **Validation:** class-validator
- **HTTP Client:** Axios

### Frontend
- **Framework:** Vue.js 3
- **UI Library:** Vuetify
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **Charts:** Chart.js, ECharts
- **Animations:** Animate.css

### DevOps
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx
- **CI/CD:** (можно добавить GitHub Actions/GitLab CI)

## 📞 Поддержка

Для получения помощи:
1. Проверьте [DEPLOYMENT.md](DEPLOYMENT.md) для решения проблем развертывания
2. Просмотрите логи: `docker compose logs`
3. Создайте issue в репозитории

## 📄 Лицензия

UNLICENSED - Частный проект

---

**Версия:** Beta 1.4  
**Последнее обновление:** Декабрь 2024
