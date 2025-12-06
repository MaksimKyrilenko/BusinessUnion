# Интеграция Crypto Tracker - Инструкция

## ✅ Что было сделано

### Backend

1. **Создан модуль `crypto-tracker`** с полной интеграцией:
   - `CryptoTrackerService` - сервис для работы с CoinGecko и LunarCrush API
   - `CryptoTrackerController` - REST API эндпоинты
   - `CryptoTrackerModule` - модуль NestJS
   - Интерфейсы TypeScript для типизации данных

2. **Доступные API эндпоинты:**
   - `GET /api/crypto/top-coins?limit=20` - топ монет
   - `GET /api/crypto/social-metrics?symbols=BTC,ETH` - социальные метрики (LunarCrush)
   - `GET /api/crypto/heatmap?limit=100` - тепловая карта рынка
   - `GET /api/crypto/trust-index/:symbol` - индекс доверия монете
   - `GET /api/crypto/chart/:coinId?days=7` - данные для графика (OHLC)
   - `GET /api/crypto/btc-dominance` - доминирование BTC
   - `GET /api/crypto/fear-greed` - индекс страха и жадности
   - `GET /api/crypto/tokenomics/:coinId` - токеномика монеты
   - `GET /api/crypto/overview` - общий обзор рынка

### Frontend

1. **Обновлён `CryptoTracker.vue`:**
   - Заменены моковые данные на реальные API вызовы
   - Добавлена загрузка топ монет с CoinGecko
   - Добавлена загрузка BTC доминирования
   - Добавлена загрузка индекса страха и жадности
   - Добавлена загрузка данных для графика (OHLC)
   - Автоматическое обновление данных каждую минуту
   - Fallback на моковые данные при ошибках API

## 🔧 Настройка

### Шаг 1: Добавьте API ключи в `.env`

Откройте файл `backend/.env` и добавьте следующие строки:

```env
# Market Data API Keys
COINGECKO_API_KEY=CG-aYnG5dQWs45mdq9CJbmngiDz
LUNARCRUSH_API_KEY=b908focfgygflqg04pbnkd9w2hbmidhb3jt2cpylqv
```

### Шаг 2: Перезапустите backend

```bash
cd backend
npm run start:dev
```

### Шаг 3: Проверьте работу API

Откройте в браузере:
- `http://localhost:3001/api/crypto/top-coins?limit=10`
- `http://localhost:3001/api/crypto/overview`

## 📊 Что можно делать с текущими API

### CoinGecko API (`CG-aYnG5dQWs45mdq9CJbmngiDz`)

✅ **Уже реализовано:**
- Получение цен и рыночных данных монет
- Исторические данные (OHLC) для графиков
- Токеномика (supply, market cap)
- Доминирование BTC
- Топ монет по капитализации

✅ **Можно добавить:**
- Категории монет (`/coins/categories`) - для тепловой карты по секторам
- Тренды (`/search/trending`) - популярные монеты
- Глобальная статистика (`/global`) - общая капитализация рынка

### LunarCrush API (`b908focfgygflqg04pbnkd9w2hbmidhb3jt2cpylqv`)

✅ **Уже реализовано:**
- Galaxy Score - общий рейтинг монеты
- Alt Rank - ранжирование альткоинов
- Social Volume - объём упоминаний
- Social Score - оценка социальной активности
- Social Influence - влияние в соцсетях

✅ **Можно добавить:**
- Детальная информация о монете (`/assets/{symbol}`)
- Исторические социальные данные
- Топ монет по социальной активности
- Индекс хайпа (на основе социальных метрик)

## 🚀 Следующие шаги для полной реализации требований

### 1. Персональный индекс доверия монете ✅ (частично)
- ✅ Волатильность и объём - из CoinGecko
- ✅ Социальная активность - из LunarCrush
- ⏳ Новости - нужен CryptoPanic API
- ⏳ Полный алгоритм с весами

### 2. Сканер аномалий рынка ⏳
- Нужно: WebSocket подключение к Binance/Bybit для real-time данных
- Или: периодический анализ изменений цен/объёмов

### 3. Мониторинг китов ⏳
- Нужен: Whale Alert API или Glassnode API
- Альтернатива: парсинг блокчейна (сложно)

### 4. Тепловая карта рынка ✅ (частично)
- ✅ Базовые данные из CoinGecko
- ⏳ Категоризация по секторам (DeFi, L1, L2 и т.д.)

### 5. Анализ токеномики ✅ (частично)
- ✅ Базовые данные (supply, market cap) из CoinGecko
- ⏳ График разблокировок - нужен TokenUnlocks API
- ⏳ Распределение токенов - нужен анализ контрактов

### 6. Прогноз движения цены ⏳
- Нужен: ML сервис (можно использовать Python + TensorFlow/PyTorch)
- Или: сторонний ML API (DeepAlgo, CryptoPredict)

### 7. Проверка на скам ⏳
- Нужен: GoPlus Security API или TokenSniffer API
- Альтернатива: анализ контракта вручную

### 8. Инвесторские кейсы ⏳
- Можно реализовать на основе существующих данных
- Нужна логика генерации стратегий

### 9. История новостей ⏳
- Нужен: CryptoPanic API или NewsAPI
- Альтернатива: парсинг RSS лент

### 10. Социальный индекс хайпа ✅ (частично)
- ✅ Базовые метрики из LunarCrush
- ⏳ Интеграция Twitter/Reddit/Telegram (нужны дополнительные API)

## 📝 Рекомендации по дополнительным API

Для полной реализации всех функций рекомендуется добавить:

1. **CryptoPanic API** - новости и сентимент
   - Бесплатный план: 100 запросов/день
   - URL: https://cryptopanic.com/developers/api/

2. **Whale Alert API** - мониторинг крупных транзакций
   - Бесплатный план: ограниченный
   - URL: https://whale-alert.io/

3. **GoPlus Security API** - проверка на скам
   - Бесплатный план: есть
   - URL: https://docs.gopluslabs.io/

4. **TokenUnlocks API** - токеномика и разблокировки
   - Платный, но есть бесплатный tier
   - URL: https://tokenunlocks.com/

5. **Alternative.me API** - индекс страха и жадности
   - Бесплатный
   - URL: https://alternative.me/crypto/fear-and-greed-index/

## 🧪 Тестирование

После настройки проверьте:

1. Backend запущен и доступен на `http://localhost:3001`
2. API ключи добавлены в `.env`
3. Эндпоинты возвращают данные (проверьте в браузере или Postman)
4. Frontend загружает данные (откройте вкладку Crypto Tracker)

## 💡 Примечания

- Все API вызовы имеют fallback на моковые данные при ошибках
- Данные обновляются автоматически каждую минуту
- При отсутствии API ключей используются моковые данные
- Логирование ошибок происходит в консоль backend



