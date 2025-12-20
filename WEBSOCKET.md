# WebSocket Integration

## Архитектура

WebSocket сервер вынесен в **отдельный контейнер** для удобства отладки и масштабирования.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│    Nginx    │────▶│  WebSocket  │
│   (Vue.js)  │     │   (proxy)   │     │   Server    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                           ┌───────────────────┘
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │  (pub/sub)  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Backend   │
                    │  (NestJS)   │
                    └─────────────┘
```

## Контейнеры

| Контейнер | Порт | Описание |
|-----------|------|----------|
| `businessunion-backend` | 3001 | REST API |
| `businessunion-websocket` | 3002 | Socket.IO сервер |
| `businessunion-redis` | 6379 | Pub/Sub для событий |
| `businessunion-frontend` | 80 | Vue.js + Nginx |

## Просмотр логов

```bash
# Логи WebSocket сервера (основные для отладки)
docker logs -f businessunion-websocket

# Логи backend (отправка событий в Redis)
docker logs -f businessunion-backend

# Логи Redis
docker logs -f businessunion-redis

# Все логи вместе
docker-compose logs -f websocket backend redis
```

## События

### Подключение
- `connected` - успешное подключение с данными пользователя
- `user:online` - пользователь вошел в сеть
- `user:offline` - пользователь вышел из сети

### Чат
- `chat:join` - присоединиться к комнате чата
- `chat:leave` - покинуть комнату чата
- `chat:typing` - индикатор "печатает"
- `chat:read` - сообщение прочитано
- `chat:newMessage` - новое сообщение
- `chat:messageEdited` - сообщение отредактировано
- `chat:messageDeleted` - сообщение удалено

### Проекты
- `project:join` / `project:leave` - комнаты проектов
- `project:update` - обновление проекта

### Сообщества
- `community:join` / `community:leave` - комнаты сообществ
- `community:update` - обновление сообщества

### Крипто
- `crypto:update` - обновление крипто-данных

### Уведомления
- `notification` - push-уведомление

## Frontend использование

```javascript
import websocketService from '@/services/websocket.service';

// Подключение (автоматически при наличии токена)
websocketService.connect();

// Подписка на события
const unsubscribe = websocketService.on('chat:newMessage', (message) => {
  console.log('Новое сообщение:', message);
});

// Присоединение к чату
websocketService.joinChat(chatId);

// Отправка статуса "печатает"
websocketService.sendTyping(chatId, true);

// Отписка
unsubscribe();
```

## Как работает отправка сообщений

1. **Frontend** отправляет HTTP POST на `/api/messages`
2. **Backend** сохраняет сообщение в БД
3. **Backend** публикует событие в **Redis** (`websocket:events`)
4. **WebSocket Server** получает событие из Redis
5. **WebSocket Server** отправляет сообщение всем клиентам в комнате чата

## Отладка

### Логи WebSocket сервера

При подключении клиента:
```
[WebsocketGateway] === New Connection Attempt ===
[WebsocketGateway] Socket ID: abc123xyz
[WebsocketGateway] Transport: websocket
[WebsocketGateway] Token received (length: 200)
[WebsocketGateway] Token verified. User ID: 1
[WebsocketGateway] === User 1 Connected Successfully ===
```

При присоединении к чату:
```
[WebsocketGateway] [CHAT:JOIN] User 1 joined room chat:5
[WebsocketGateway] [CHAT:JOIN] Client abc123xyz rooms: abc123xyz, user:1, chat:5
```

При получении события из Redis:
```
[RedisService] [REDIS] Received event: chat:newMessage
[WebsocketGateway] [REDIS->WS] chat:newMessage for chat 5
[WebsocketGateway] === SENDING NEW MESSAGE ===
[WebsocketGateway] Room: chat:5
[WebsocketGateway] Clients in room: 2
```

### Логи Backend

При отправке сообщения:
```
[REDIS] Отправка сообщения 123 в чат 5
[RedisPublisherService] [REDIS] Publishing event: chat:newMessage
[RedisPublisherService] [REDIS] Event chat:newMessage published successfully
```

### Консоль браузера

```
=== WebSocket Connect Called ===
WebSocket: Token found (length: 200)
=== WebSocket Connection Details ===
URL: http://localhost (или http://localhost:3002 в dev)
=== WebSocket CONNECTED ===
Socket ID: abc123xyz
Transport: websocket
=== WebSocket AUTHENTICATED ===
User ID: 1
Online users: [1, 2, 3]
[WS] joinChat called, chatId: 5, connected: true
[WS] joinChat response: { success: true, room: 'chat:5' }
WebSocket: New message received { id: 123, text: '...', ... }
```

## Health Check

```bash
# Проверка WebSocket сервера
curl http://localhost:3002/health

# Ответ:
{
  "status": "ok",
  "service": "websocket-server",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "connections": 5,
  "onlineUsers": 3,
  "redis": true
}

# Статистика
curl http://localhost:3002/stats
```

## Проверка в консоли браузера

Откройте консоль браузера (F12) и проверьте следующие логи:

### При загрузке страницы:
```
=== Router Ready - Checking WebSocket ===
Token exists: true
Initiating WebSocket connection from main.js
=== WebSocket Connect Called ===
=== WebSocket CONNECTED ===
Socket ID: xxx
=== WebSocket AUTHENTICATED ===
User ID: 1
```

### При открытии мессенджера:
```
=== Messenger onMounted ===
Calling setupWebSocketHandlers...
=== setupWebSocketHandlers CALLED ===
WebSocket connected: true
[WS] Subscribed to event: chat:newMessage, total listeners: 1
setupWebSocketHandlers completed
```

### При выборе чата:
```
[WS] joinChat called, chatId: 5, connected: true
[WS] joinChat response: { success: true, room: 'chat:5' }
```

### При получении сообщения:
```
=== WebSocket: SOCKET.IO EVENT chat:newMessage ===
Message ID: 123
Chat ID: 5
Listeners count: 1
[WS] Emitting event: chat:newMessage, listeners: 1
[WS] Calling listener 1 for chat:newMessage
WebSocket: Получено новое сообщение 123 chatId: 5
```

Если какой-то из этих логов отсутствует - это указывает на проблему.

## Частые проблемы

### 1. WebSocket не подключается
- Проверьте токен в localStorage
- Проверьте логи: `docker logs businessunion-websocket`
- Убедитесь что Redis работает: `docker logs businessunion-redis`

### 2. Сообщения не приходят в реальном времени
- Проверьте что клиент присоединился к комнате (joinChat)
- Проверьте логи backend - видно ли `[REDIS] Publishing event`
- Проверьте логи websocket - видно ли `[REDIS] Received event`

### 3. Ошибка аутентификации
- Проверьте JWT_SECRET одинаковый в backend и websocket
- Убедитесь что токен не истёк

### 4. Redis не подключается
```bash
# Проверка Redis
docker exec -it businessunion-redis redis-cli ping
# Должен ответить: PONG
```

## Переменные окружения

```env
# WebSocket Server
WS_PORT=3002
WS_CORS_ORIGIN=*
JWT_SECRET=your-secret-key
REDIS_HOST=redis
REDIS_PORT=6379

# Backend
REDIS_HOST=redis
REDIS_PORT=6379
```
