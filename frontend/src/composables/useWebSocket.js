import { ref, onMounted, onUnmounted, computed } from 'vue';
import websocketService from '@/services/websocket.service';

/**
 * Composable для работы с WebSocket
 */
export function useWebSocket() {
  const isConnected = computed(() => websocketService.isConnected.value);
  const onlineUsers = computed(() => websocketService.onlineUsers.value);

  // Подключение при монтировании
  onMounted(() => {
    if (!websocketService.connected) {
      websocketService.connect();
    }
  });

  return {
    isConnected,
    onlineUsers,
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    reconnect: () => websocketService.reconnect(),
    isUserOnline: (userId) => websocketService.isUserOnline(userId),
    on: (event, callback) => websocketService.on(event, callback),
    off: (event, callback) => websocketService.off(event, callback),
  };
}

/**
 * Composable для чата с WebSocket
 */
export function useChatWebSocket(chatId) {
  const typingUsers = ref([]);
  const unsubscribers = [];

  onMounted(() => {
    if (chatId) {
      // Присоединяемся к комнате чата
      websocketService.joinChat(chatId);

      // Подписываемся на события типинга
      const unsubTyping = websocketService.on('chat:typing', (data) => {
        if (data.chatId === chatId) {
          typingUsers.value = websocketService.getTypingUsers(chatId);
        }
      });
      unsubscribers.push(unsubTyping);
    }
  });

  onUnmounted(() => {
    if (chatId) {
      websocketService.leaveChat(chatId);
    }
    // Отписываемся от всех событий
    unsubscribers.forEach(unsub => unsub());
  });

  return {
    typingUsers,
    sendTyping: (isTyping) => websocketService.sendTyping(chatId, isTyping),
    markAsRead: (messageId) => websocketService.markAsRead(chatId, messageId),
    onNewMessage: (callback) => websocketService.on('chat:newMessage', callback),
    onMessageEdited: (callback) => websocketService.on('chat:messageEdited', callback),
    onMessageDeleted: (callback) => websocketService.on('chat:messageDeleted', callback),
    onMessageRead: (callback) => websocketService.on('chat:read', callback),
  };
}

/**
 * Composable для проекта с WebSocket
 */
export function useProjectWebSocket(projectId) {
  const unsubscribers = [];

  onMounted(() => {
    if (projectId) {
      websocketService.joinProject(projectId);
    }
  });

  onUnmounted(() => {
    if (projectId) {
      websocketService.leaveProject(projectId);
    }
    unsubscribers.forEach(unsub => unsub());
  });

  return {
    onProjectUpdate: (callback) => {
      const unsub = websocketService.on('project:update', callback);
      unsubscribers.push(unsub);
      return unsub;
    },
  };
}

/**
 * Composable для сообщества с WebSocket
 */
export function useCommunityWebSocket(communityId) {
  const unsubscribers = [];

  onMounted(() => {
    if (communityId) {
      websocketService.joinCommunity(communityId);
    }
  });

  onUnmounted(() => {
    if (communityId) {
      websocketService.leaveCommunity(communityId);
    }
    unsubscribers.forEach(unsub => unsub());
  });

  return {
    onCommunityUpdate: (callback) => {
      const unsub = websocketService.on('community:update', callback);
      unsubscribers.push(unsub);
      return unsub;
    },
  };
}

/**
 * Composable для крипто-данных с WebSocket
 */
export function useCryptoWebSocket() {
  const unsubscribers = [];

  return {
    onCryptoUpdate: (callback) => {
      const unsub = websocketService.on('crypto:update', callback);
      unsubscribers.push(unsub);
      return unsub;
    },
    cleanup: () => {
      unsubscribers.forEach(unsub => unsub());
    },
  };
}

/**
 * Composable для уведомлений с WebSocket
 */
export function useNotifications() {
  const notifications = ref([]);
  const unreadCount = ref(0);

  onMounted(() => {
    websocketService.on('notification', (notification) => {
      notifications.value.unshift(notification);
      if (!notification.read) {
        unreadCount.value++;
      }
    });
  });

  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  };

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true);
    unreadCount.value = 0;
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export default useWebSocket;
