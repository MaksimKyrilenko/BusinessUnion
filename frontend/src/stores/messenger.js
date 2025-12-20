import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import websocketService from '@/services/websocket.service'

export const useMessengerStore = defineStore('messenger', () => {
  // Общее количество непрочитанных сообщений
  const totalUnreadCount = ref(0)
  
  // Очередь уведомлений для отображения
  const notificationQueue = ref([])
  
  // Текущий открытый чат (для фильтрации уведомлений)
  const currentChatId = ref(null)
  
  // Таймер для автоскрытия уведомлений
  let hideTimer = null
  
  // Установить количество непрочитанных
  const setUnreadCount = (count) => {
    totalUnreadCount.value = count
  }
  
  // Увеличить счётчик
  const incrementUnread = () => {
    totalUnreadCount.value++
  }
  
  // Уменьшить счётчик
  const decrementUnread = (count = 1) => {
    totalUnreadCount.value = Math.max(0, totalUnreadCount.value - count)
  }
  
  // Установить текущий чат
  const setCurrentChat = (chatId) => {
    currentChatId.value = chatId
  }
  
  // Добавить уведомление о новом сообщении
  const addMessageNotification = (message, chatName, senderName) => {
    // Не показываем уведомление если пользователь в этом чате
    if (currentChatId.value === message.chatId) {
      return
    }
    
    // Не показываем уведомление для своих сообщений
    const myUserId = localStorage.getItem('userId')
    const senderId = message.senderId || message.sender?.id
    if (String(senderId) === String(myUserId)) {
      return
    }
    
    const notification = {
      id: `msg-${message.id}-${Date.now()}`,
      messageId: message.id,
      chatId: message.chatId,
      chatName: chatName || 'Чат',
      senderName: senderName || 'Пользователь',
      text: message.text || 'Новое сообщение',
      type: message.type || 'text',
      timestamp: Date.now()
    }
    
    notificationQueue.value.push(notification)
    
    // Сбрасываем таймер автоскрытия
    resetHideTimer()
  }
  
  // Удалить уведомление
  const removeNotification = (id) => {
    const index = notificationQueue.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notificationQueue.value.splice(index, 1)
    }
  }
  
  // Очистить все уведомления
  const clearNotifications = () => {
    notificationQueue.value = []
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }
  
  // Сбросить таймер автоскрытия (4.5 секунды после последнего сообщения)
  const resetHideTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
    }
    
    hideTimer = setTimeout(() => {
      clearNotifications()
    }, 4500)
  }
  
  // Загрузить начальное количество непрочитанных
  const loadUnreadCount = async () => {
    try {
      const messengerService = (await import('@/services/messenger.service')).default
      const response = await messengerService.getChats()
      if (response?.data) {
        const count = response.data.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
        totalUnreadCount.value = count
      }
    } catch (error) {
      console.error('Ошибка при загрузке количества непрочитанных:', error)
    }
  }
  
  return {
    totalUnreadCount,
    notificationQueue,
    currentChatId,
    setUnreadCount,
    incrementUnread,
    decrementUnread,
    setCurrentChat,
    addMessageNotification,
    removeNotification,
    clearNotifications,
    loadUnreadCount
  }
})
