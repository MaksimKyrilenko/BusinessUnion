# WebSocket Integration

## Обзор

Проект использует Socket.IO для real-time коммуникации между клиентом и сервером.

## Backend (NestJS)

### Структура файлов

```
backend/src/websocket/
├── websocket.module.ts      # Модуль WebSocket
├── websocket.gateway.ts     # Gateway для обработки событий
├── websocket.service.ts     # Сервис для управления подключениями
├── crypto-updates.service.ts # Сервис для обновления крипто-данных
└── index.ts                 # Экспорты
```

### События

#### Подключение
- `connected` - успешное подключение с данными пользователя
- `user:online` - пользователь вошел в сеть
- `user:offline` - пользователь вышел из сети

#### Чат
- `chat:join` - присоединиться к комнате чата
- `chat:leave` - покинуть комнату чата
- `chat:typing` - индикатор "печатает"
- `chat:read` - сообщение прочитано
- `chat:newMessage` - новое сообщение
- `chat:messageEdited` - сообщение отредактировано
- `chat:messageDeleted` - сообщение удалено

#### Проекты
- `project:join` - присоединиться к комнате проекта
- `project:leave` - покинуть комнату проекта
- `project:update` - обновление проекта

#### Сообщества
- `community:join` - присоединиться к комнате сообщества
- `community:leave` - покинуть комнату сообщества
- `community:update` - обновление сообщества

#### Крипто
- `crypto:update` - обновление крипто-данных (цены, индексы, аномалии)

#### Уведомления
- `notification` - push-уведомление

## Frontend (Vue.js)

### Сервис WebSocket

```javascript
import websocketService from '@/services/websocket.service';

// Подключение
websocketService.connect();

// Отключение
websocketService.disconnect();

// Проверка статуса
websocketService.connected; // boolean

// Подписка на события
const unsubscribe = websocketService.on('chat:newMessage', (message) => {
  console.log('Новое сообщение:', message);
});

// Отписка
unsubscribe();
```

### Composables

```javascript
import { useWebSocket, useChatWebSocket, useNotifications } from '@/composables/useWebSocket';

// Базовый WebSocket
const { isConnected, onlineUsers, isUserOnline } = useWebSocket();

// Для чата
const { typingUsers, sendTyping, onNewMessage } = useChatWebSocket(chatId);

// Для уведомлений
const { notifications, unreadCount, markAsRead } = useNotifications();
```

### Компоненты

- `<OnlineStatus :userId="123" />` - индикатор онлайн-статуса
- `<TypingIndicator :users="typingUsers" />` - индикатор "печатает"
- `<NotificationBell />` - колокольчик уведомлений

## Аутентификация

WebSocket использует JWT токен для аутентификации. Токен передается при подключении:

```javascript
const socket = io(url, {
  auth: { token: 'your-jwt-token' }
});
```

## Комнаты

- `user:{userId}` - персональная комната пользователя
- `chat:{chatId}` - комната чата
- `project:{projectId}` - комната проекта
- `community:{communityId}` - комната сообщества

## Docker конфигурация

WebSocket работает через тот же backend контейнер. В `docker-compose.yml` добавлены:

```yaml
backend:
  environment:
    WS_CORS_ORIGIN: ${WS_CORS_ORIGIN:-*}  # CORS для WebSocket
  ulimits:
    nofile:
      soft: 65536
      hard: 65536  # Увеличенные лимиты для множества соединений
```

## Nginx конфигурация

```nginx
location /socket.io {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
}
```

## Примеры использования

### Отправка сообщения с real-time обновлением

```javascript
// В компоненте чата
import messengerService from '@/services/messenger.service';

// Подписка на новые сообщения
messengerService.onNewMessage((message) => {
  messages.value.push(message);
});

// Присоединение к чату
messengerService.joinChat(chatId);

// Отправка статуса "печатает"
messengerService.sendTyping(chatId, true);
```

### Отображение онлайн-статуса

```vue
<template>
  <div class="user-card">
    <span>{{ user.name }}</span>
    <OnlineStatus :userId="user.id" showText />
  </div>
</template>
```

### Уведомления

```vue
<template>
  <header>
    <NotificationBell />
  </header>
</template>
```
