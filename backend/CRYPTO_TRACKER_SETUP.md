# Настройка Crypto Tracker

## Добавление API ключей

Добавьте следующие ключи в файл `backend/.env`:

```env
# Crypto Tracker API Keys
COINGECKO_API_KEY=CG-aYnG5dQWs45mdq9CJbmngiDz
LUNARCRUSH_API_KEY=b908focfgygflqg04pbnkd9w2hbmidhb3jt2cpylqv
```

## Доступные API эндпоинты

### 1. Топ монет
```
GET /api/crypto/top-coins?limit=20
```
Возвращает список топ монет с ценами, объёмами и изменениями.

### 2. Социальные метрики (LunarCrush)
```
GET /api/crypto/social-metrics?symbols=BTC,ETH,SOL
```
Возвращает социальные метрики для указанных монет:
- Galaxy Score
- Alt Rank
- Social Volume
- Social Score
- Social Influence

### 3. Тепловая карта рынка
```
GET /api/crypto/heatmap?limit=100
```
Возвращает данные для тепловой карты с категоризацией по капитализации.

### 4. Индекс доверия монете
```
GET /api/crypto/trust-index/BTC
```
Вычисляет персональный индекс доверия (0-100) на основе:
- Волатильности
- Объёма торгов
- Социальной активности
- Новостного фона

### 5. Данные для графика
```
GET /api/crypto/chart/bitcoin?days=7&vs_currency=usd
```
Возвращает OHLC данные для построения свечного графика.

### 6. Доминирование BTC
```
GET /api/crypto/btc-dominance
```

### 7. Индекс страха и жадности
```
GET /api/crypto/fear-greed
```
(Пока возвращает моковое значение, требуется отдельный API)

### 8. Токеномика монеты
```
GET /api/crypto/tokenomics/bitcoin
```
Возвращает данные о:
- Total Supply
- Circulating Supply
- Max Supply
- Market Cap
- Inflation Rate

### 9. Общий обзор рынка
```
GET /api/crypto/overview
```
Возвращает комбинированные данные:
- Топ 10 монет
- BTC доминирование
- Индекс страха и жадности
- Тепловая карта (50 монет)

## Что можно делать с LunarCrush API

LunarCrush API (`b908focfgygflqg04pbnkd9w2hbmidhb3jt2cpylqv`) предоставляет:

1. **Galaxy Score** - общий рейтинг монеты (0-100)
2. **Alt Rank** - ранжирование альткоинов
3. **Social Volume** - объём упоминаний в соцсетях
4. **Social Score** - оценка социальной активности
5. **Social Influence** - влияние в социальных сетях
6. **Social Contributors** - количество активных участников обсуждений

Эти данные используются для:
- Социального индекса хайпа
- Персонального индекса доверия
- Анализа трендов в соцсетях
- Обнаружения аномалий в социальной активности

## Что можно делать с CoinGecko API

CoinGecko API (`CG-aYnG5dQWs45mdq9CJbmngiDz`) предоставляет:

1. **Цены и рыночные данные** - актуальные цены, объёмы, капитализация
2. **Исторические данные** - OHLC для графиков
3. **Токеномика** - данные о supply, inflation
4. **Категории монет** - для тепловой карты
5. **Глобальная статистика** - доминирование BTC, общая капитализация

## Следующие шаги

Для полной реализации всех функций из списка требований потребуется:

1. **Whale Alert API** - для мониторинга крупных транзакций
2. **GoPlus Security API** - для проверки на скам
3. **CryptoPanic API** - для новостей и сентимента
4. **TokenUnlocks API** - для детальной токеномики
5. **Alternative.me API** - для индекса страха и жадности
6. **ML сервис** - для прогноза цены (можно использовать собственный)



