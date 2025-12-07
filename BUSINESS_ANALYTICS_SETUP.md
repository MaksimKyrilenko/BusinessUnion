# Настройка бизнес-аналитики

## Что было сделано

### 1. Backend изменения

#### Новый сервис `BusinessAnalyticsService`
- **Файл**: `backend/src/market-analytics/business-analytics.service.ts`
- **Функции**:
  - `getStartupStatistics()` - статистика стартапов
  - `getTopStartups()` - топ стартапы по ROI
  - `getInvestmentTrends()` - тренды инвестиций
  - `getCategoryDistribution()` - распределение по категориям
  - `getRiskAnalysis()` - анализ рисков
  - `getMarketForecast()` - прогноз рынка

#### Обновленный `MarketAnalyticsService`
- **Файл**: `backend/src/market-analytics/market-analytics.service.ts`
- **Изменения**:
  - Добавлены fallback моковые данные
  - Улучшена обработка ошибок
  - Добавлены таймауты для API запросов

#### Новые API эндпоинты
- `GET /api/market-analytics/business/startup-stats` - статистика стартапов
- `GET /api/market-analytics/business/top-startups?limit=5` - топ стартапы
- `GET /api/market-analytics/business/investment-trends` - тренды инвестиций
- `GET /api/market-analytics/business/category-distribution` - распределение категорий
- `GET /api/market-analytics/business/risk-analysis` - анализ рисков
- `GET /api/market-analytics/business/market-forecast` - прогноз рынка

### 2. Frontend изменения

#### Обновленный `BusinessmanDashboard`
- **Файл**: `frontend/src/components/dashboards/BusinessmanDashboard.vue`
- **Новые секции**:
  - 📊 Статистика стартапов
  - 🏆 Топ стартапы
  - ⚠️ Анализ рисков
  - 📈 Прогноз рынка

#### Обновленный `MarketAnalytics.vue`
- **Файл**: `frontend/src/views/businessman/MarketAnalytics.vue`
- **Изменения**:
  - Интеграция с реальными API
  - Fallback на моковые данные при ошибках

#### Обновленный сервис
- **Файл**: `frontend/src/services/marketAnalytics.service.js`
- **Новые методы**:
  - `getStartupStatistics()`
  - `getTopStartups()`
  - `getInvestmentTrends()`
  - `getCategoryDistribution()`
  - `getRiskAnalysis()`
  - `getMarketForecast()`

## Как настроить

### 1. Создайте .env файл в backend

```bash
# В папке backend создайте файл .env
touch backend/.env
```

Добавьте в файл:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=businessunion
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# API Keys for Market Data (опционально)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
EXCHANGE_RATES_API_KEY=your_exchange_rates_api_key_here

# Frontend URL
FRONTEND_URL=http://localhost:8081
```

### 2. Получите API ключи (опционально)

#### Alpha Vantage (для акций и новостей)
1. Зарегистрируйтесь на https://www.alphavantage.co/support/#api-key
2. Получите бесплатный API ключ
3. Добавьте в .env файл

#### Exchange Rates API (для валют)
1. Зарегистрируйтесь на https://exchangeratesapi.io/
2. Получите API ключ
3. Добавьте в .env файл

### 3. Перезапустите backend

```bash
cd backend
npm run start:dev
```

### 4. Перезапустите frontend

```bash
cd frontend
npm run serve
```

## Что получите

### Без API ключей
- ✅ Работающие моковые данные
- ✅ Красивый интерфейс
- ✅ Все функции бизнес-аналитики

### С API ключами
- ✅ Реальные данные криптовалют (CoinGecko - бесплатно)
- ✅ Реальные данные акций (Alpha Vantage)
- ✅ Реальные новости рынка (Alpha Vantage)
- ✅ Данные из вашей базы данных

## Структура данных

### Статистика стартапов
```json
{
  "totalStartups": 150,
  "activeStartups": 89,
  "totalInvestments": 25000000,
  "averageRoi": 25.5
}
```

### Топ стартапы
```json
[
  {
    "id": 1,
    "title": "AI Platform",
    "category": { "name": "Технологии" },
    "expectedRoi": 45,
    "investmentNeeded": 500000,
    "author": { "firstName": "Иван", "lastName": "Петров" }
  }
]
```

### Анализ рисков
```json
{
  "highRisk": 25,
  "mediumRisk": 60,
  "lowRisk": 65
}
```

### Прогноз рынка
```json
{
  "marketGrowth": 15,
  "trends": [
    "Рост инвестиций в AI и ML",
    "Развитие экологических проектов",
    "Увеличение интереса к Web3",
    "Фокус на кибербезопасности"
  ]
}
```

## Тестирование

1. Откройте http://localhost:8081
2. Войдите как пользователь с типом `businessman`
3. Перейдите в Dashboard
4. Проверьте секцию "Бизнес-аналитика"
5. Перейдите в "Бизнес аналитика" в меню

## Возможные проблемы

### 1. Ошибки базы данных
- Убедитесь, что MySQL запущен
- Проверьте настройки подключения в .env
- Выполните миграции: `npm run migration:run`

### 2. Ошибки API
- Проверьте API ключи в .env
- Убедитесь, что интернет подключение работает
- Проверьте логи backend в консоли

### 3. Ошибки frontend
- Проверьте, что backend запущен на порту 3001
- Убедитесь, что CORS настроен правильно
- Проверьте консоль браузера на ошибки

## Дальнейшее развитие

### Возможные улучшения:
1. **Кэширование данных** - Redis для кэширования API ответов
2. **Реалтайм обновления** - WebSocket для live данных
3. **Больше источников данных** - Yahoo Finance, Google Finance
4. **Аналитика пользователей** - трекинг поведения
5. **Экспорт данных** - PDF/Excel отчеты
6. **Уведомления** - алерты при изменениях рынка
