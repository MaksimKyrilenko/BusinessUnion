import { io } from 'socket.io-client';
import { ref, reactive } from 'vue';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = ref(false);
    this.onlineUsers = ref([]);
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.pendingChatId = null; // Чат для присоединения после подключения
    
    // Состояние типинга для чатов
    this.typingUsers = reactive({});
  }

  /**
   * Подключение к WebSocket серверу
   */
  connect() {
    console.log('=== WebSocket Connect Called ===');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('WebSocket: No token found, skipping connection');
      return;
    }
    
    console.log('WebSocket: Token found (length:', token.length, ')');

    // Проверяем, есть ли уже активное соединение
    if (this.socket?.connected) {
      console.log('WebSocket: Already connected, socket id:', this.socket.id);
      return;
    }

    // Если есть сокет но он не подключен - закрываем его
    if (this.socket) {
      console.log('WebSocket: Closing existing disconnected socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Определяем URL для подключения
    const wsUrl = this.getWebSocketUrl();
    
    console.log('=== WebSocket Connection Details ===');
    console.log('URL:', wsUrl);
    console.log('Hostname:', window.location.hostname);
    console.log('Port:', window.location.port);
    console.log('Origin:', window.location.origin);

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // Важно: не создавать множественные соединения
      multiplex: false,
    });

    console.log('WebSocket: Socket instance created');
    this.setupEventListeners();
  }

  /**
   * Получить URL для WebSocket подключения
   */
  getWebSocketUrl() {
    // Если задана переменная окружения, используем её
    if (process.env.VUE_APP_WS_URL) {
      return process.env.VUE_APP_WS_URL;
    }
    
    // В Docker/production используем тот же origin (nginx проксирует на websocket:3002)
    // В development на localhost:8081 подключаемся к websocket серверу на 3002
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Если это development сервер Vue (порт 8081)
    if (hostname === 'localhost' && port === '8081') {
      return 'http://localhost:3002';
    }
    
    // В остальных случаях (Docker, production) используем текущий origin
    // nginx проксирует /socket.io на websocket контейнер
    return window.location.origin;
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    console.log('=== Setting up WebSocket Event Listeners ===');
    
    // Подключение
    this.socket.on('connect', () => {
      console.log('=== WebSocket CONNECTED ===');
      console.log('Socket ID:', this.socket.id);
      console.log('Transport:', this.socket.io?.engine?.transport?.name);
      this.isConnected.value = true;
      this.reconnectAttempts = 0;
    });

    // Успешная аутентификация
    this.socket.on('connected', (data) => {
      console.log('=== WebSocket AUTHENTICATED ===');
      console.log('User ID:', data.userId);
      console.log('Socket ID:', data.socketId);
      console.log('Online users:', data.onlineUsers);
      this.onlineUsers.value = data.onlineUsers || [];
      
      // Присоединяемся к отложенному чату если есть
      this.joinPendingChat();
    });

    // Отключение
    this.socket.on('disconnect', (reason) => {
      console.log('=== WebSocket DISCONNECTED ===');
      console.log('Reason:', reason);
      this.isConnected.value = false;
    });

    // Ошибка подключения
    this.socket.on('connect_error', (error) => {
      console.error('=== WebSocket CONNECTION ERROR ===');
      console.error('Error:', error.message);
      console.error('Description:', error.description);
      console.error('Type:', error.type);
      this.reconnectAttempts++;
      console.log('Reconnect attempt:', this.reconnectAttempts, '/', this.maxReconnectAttempts);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('WebSocket: Max reconnection attempts reached');
      }
    });

    // Ошибка
    this.socket.on('error', (error) => {
      console.error('=== WebSocket ERROR ===');
      console.error('Error:', error);
    });

    // Пользователь онлайн
    this.socket.on('user:online', (data) => {
      if (!this.onlineUsers.value.includes(data.userId)) {
        this.onlineUsers.value.push(data.userId);
      }
      this.emit('user:online', data);
    });

    // Пользователь оффлайн
    this.socket.on('user:offline', (data) => {
      this.onlineUsers.value = this.onlineUsers.value.filter(id => id !== data.userId);
      this.emit('user:offline', data);
    });

    // ==================== CHAT EVENTS ====================

    // Новое сообщение
    this.socket.on('chat:newMessage', (message) => {
      console.log('=== WebSocket: SOCKET.IO EVENT chat:newMessage ===');
      console.log('Message ID:', message?.id);
      console.log('Chat ID:', message?.chatId);
      console.log('Sender ID:', message?.senderId);
      console.log('Listeners count:', this.listeners.get('chat:newMessage')?.length || 0);
      this.emit('chat:newMessage', message);
    });

    // Сообщение отредактировано
    this.socket.on('chat:messageEdited', (message) => {
      console.log('WebSocket: Message edited', message);
      this.emit('chat:messageEdited', message);
    });

    // Сообщение удалено
    this.socket.on('chat:messageDeleted', (data) => {
      console.log('WebSocket: Message deleted', data);
      this.emit('chat:messageDeleted', data);
    });

    // Кто-то печатает
    this.socket.on('chat:typing', (data) => {
      const key = `${data.chatId}`;
      if (data.isTyping) {
        if (!this.typingUsers[key]) {
          this.typingUsers[key] = [];
        }
        if (!this.typingUsers[key].includes(data.userId)) {
          this.typingUsers[key].push(data.userId);
        }
      } else {
        if (this.typingUsers[key]) {
          this.typingUsers[key] = this.typingUsers[key].filter(id => id !== data.userId);
        }
      }
      this.emit('chat:typing', data);
    });

    // Сообщение прочитано
    this.socket.on('chat:read', (data) => {
      console.log('WebSocket: Message read', data);
      this.emit('chat:read', data);
    });

    // ==================== PROJECT EVENTS ====================

    this.socket.on('project:update', (data) => {
      console.log('WebSocket: Project update', data);
      this.emit('project:update', data);
    });

    // ==================== COMMUNITY EVENTS ====================

    this.socket.on('community:update', (data) => {
      console.log('WebSocket: Community update', data);
      this.emit('community:update', data);
    });

    // ==================== CRYPTO EVENTS ====================

    this.socket.on('crypto:update', (data) => {
      this.emit('crypto:update', data);
    });

    // ==================== EXCHANGE RATES ====================

    this.socket.on('exchangeRates:update', (data) => {
      this.emit('exchangeRates:update', data);
    });

    // ==================== NOTIFICATIONS ====================

    this.socket.on('notification', (data) => {
      console.log('WebSocket: Notification', data);
      this.emit('notification', data);
    });
  }

  /**
   * Отключение от сервера
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.value = false;
    }
  }

  /**
   * Переподключение
   */
  reconnect() {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  // ==================== CHAT METHODS ====================

  /**
   * Присоединиться к чату
   */
  joinChat(chatId) {
    console.log(`[WS] joinChat called, chatId: ${chatId}, connected: ${this.socket?.connected}`);
    if (this.socket?.connected) {
      this.socket.emit('chat:join', { chatId }, (response) => {
        console.log(`[WS] joinChat response:`, response);
      });
    } else {
      console.warn('[WS] Cannot join chat - not connected, will retry when connected');
      // Сохраняем chatId для присоединения после подключения
      this.pendingChatId = chatId;
    }
  }

  /**
   * Присоединиться к отложенному чату (вызывается после подключения)
   */
  joinPendingChat() {
    if (this.pendingChatId && this.socket?.connected) {
      console.log(`[WS] Joining pending chat: ${this.pendingChatId}`);
      this.socket.emit('chat:join', { chatId: this.pendingChatId }, (response) => {
        console.log(`[WS] joinPendingChat response:`, response);
      });
      this.pendingChatId = null;
    }
  }

  /**
   * Покинуть чат
   */
  leaveChat(chatId) {
    console.log(`[WS] leaveChat called, chatId: ${chatId}, connected: ${this.socket?.connected}`);
    if (this.socket?.connected) {
      this.socket.emit('chat:leave', { chatId }, (response) => {
        console.log(`[WS] leaveChat response:`, response);
      });
    }
  }

  /**
   * Отправить статус "печатает"
   */
  sendTyping(chatId, isTyping) {
    console.log(`[WS] sendTyping called, chatId: ${chatId}, isTyping: ${isTyping}`);
    if (this.socket?.connected) {
      this.socket.emit('chat:typing', { chatId, isTyping });
    }
  }

  /**
   * Отметить сообщение как прочитанное
   */
  markAsRead(chatId, messageId) {
    if (this.socket?.connected) {
      this.socket.emit('chat:read', { chatId, messageId });
    }
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Присоединиться к проекту
   */
  joinProject(projectId) {
    if (this.socket?.connected) {
      this.socket.emit('project:join', { projectId });
    }
  }

  /**
   * Покинуть проект
   */
  leaveProject(projectId) {
    if (this.socket?.connected) {
      this.socket.emit('project:leave', { projectId });
    }
  }

  // ==================== COMMUNITY METHODS ====================

  /**
   * Присоединиться к сообществу
   */
  joinCommunity(communityId) {
    if (this.socket?.connected) {
      this.socket.emit('community:join', { communityId });
    }
  }

  /**
   * Покинуть сообщество
   */
  leaveCommunity(communityId) {
    if (this.socket?.connected) {
      this.socket.emit('community:leave', { communityId });
    }
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Подписаться на событие
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    console.log(`[WS] Subscribed to event: ${event}, total listeners: ${this.listeners.get(event).length}`);
    
    // Возвращаем функцию для отписки
    return () => this.off(event, callback);
  }

  /**
   * Отписаться от события
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Вызвать событие
   */
  emit(event, data) {
    const listeners = this.listeners.get(event);
    console.log(`[WS] Emitting event: ${event}, listeners: ${listeners?.length || 0}`);
    if (listeners && listeners.length > 0) {
      listeners.forEach((callback, index) => {
        try {
          console.log(`[WS] Calling listener ${index + 1} for ${event}`);
          callback(data);
        } catch (error) {
          console.error(`WebSocket: Error in listener for ${event}`, error);
        }
      });
    } else {
      console.warn(`[WS] No listeners for event: ${event}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Проверить, онлайн ли пользователь
   */
  isUserOnline(userId) {
    return this.onlineUsers.value.includes(userId);
  }

  /**
   * Получить пользователей, которые печатают в чате
   */
  getTypingUsers(chatId) {
    return this.typingUsers[chatId] || [];
  }

  /**
   * Проверить подключение
   */
  get connected() {
    return this.isConnected.value;
  }
}

// Создаем синглтон
const websocketService = new WebSocketService();

export default websocketService;
