import { ref, computed } from 'vue'
import messengerService from '@/services/messenger.service'
import websocketService from '@/services/websocket.service'
import { getLastMessageTime } from '@/utils/messageFormatters'

/**
 * Composable для работы с чатами
 */
export function useChats() {
  const chats = ref([])
  const selectedChat = ref(null)
  const activeTab = ref('personal')
  const searchQuery = ref('')
  const loading = ref(false)
  const chatLoading = ref(false)

  // Статистика для заголовка
  const personalChatsCount = computed(() => chats.value.filter(c => c.type === 'personal').length)
  const groupChatsCount = computed(() => chats.value.filter(c => c.type === 'group').length)
  const unreadCount = computed(() => chats.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0))

  /**
   * Получить имя для поиска (для личных чатов - имя собеседника)
   */
  const getChatSearchName = (chat, currentUserId) => {
    if (chat.type === 'group') {
      return chat.name || ''
    }
    
    // Для личных чатов ищем по имени собеседника
    if (chat.participants?.length) {
      const otherUser = chat.participants.find(
        p => String(p.id) !== String(currentUserId)
      )
      if (otherUser) {
        const firstName = otherUser.firstName || ''
        const lastName = otherUser.lastName || ''
        return `${firstName} ${lastName}`.trim()
      }
    }
    
    return chat.name || ''
  }

  /**
   * Отфильтрованные чаты
   */
  const filteredChats = computed(() => {
    const userId = localStorage.getItem('userId')
    return chats.value
      .filter(chat => {
        const matchesTab = activeTab.value === 'personal' ? chat.type === 'personal' : chat.type === 'group'
        const searchName = getChatSearchName(chat, userId)
        const matchesSearch = searchName.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchesTab && matchesSearch
      })
      .sort((a, b) => {
        // Сначала закрепленные чаты
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        
        // Затем по времени последнего сообщения
        const timeA = getLastMessageTime(a)
        const timeB = getLastMessageTime(b)
        return timeB - timeA
      })
  })

  /**
   * Загрузка списка чатов
   */
  const loadChats = async (currentUserId) => {
    try {
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId && currentUserId) {
        currentUserId.value = storedUserId
      }
      
      loading.value = true
      const response = await messengerService.getChats()
      chats.value = response.data || []
      
      if (chats.value.length > 0) {
        const unreadChat = chats.value.find(chat => chat.unreadCount > 0)
        return unreadChat ? unreadChat.id : chats.value[0].id
      }
      
      selectedChat.value = null
      return null
    } catch (error) {
      console.error('Ошибка при загрузке чатов:', error)
      chats.value = []
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Выбор чата
   */
  const selectChat = async (chatId, loadMessages, loadGroupMembers) => {
    if (selectedChat.value?.id === chatId) return
    
    // Покидаем предыдущий чат через WebSocket
    if (selectedChat.value) {
      websocketService.leaveChat(selectedChat.value.id)
    }
    
    try {
      selectedChat.value = chats.value.find(chat => chat.id === chatId)
      
      // Присоединяемся к новому чату через WebSocket
      await websocketService.joinChat(chatId)
      
      // Загружаем актуальные данные чата
      const response = await messengerService.getChat(chatId)
      if (response.data) {
        const chatIndex = chats.value.findIndex(c => c.id === chatId)
        if (chatIndex !== -1) {
          chats.value[chatIndex] = response.data
          selectedChat.value = response.data
        } else {
          selectedChat.value = response.data
        }
      }
      
      // Загружаем сообщения
      if (loadMessages) {
        await loadMessages(chatId)
      }
      
      // Загружаем участников группы
      if (selectedChat.value && selectedChat.value.type === 'group' && loadGroupMembers) {
        loadGroupMembers(chatId)
      }
      
      // Отмечаем как прочитанное (всегда при открытии чата)
      try {
        await messengerService.markChatAsRead(chatId)
        const chatIndex = chats.value.findIndex(c => c.id === chatId)
        if (chatIndex !== -1) {
          chats.value[chatIndex].unreadCount = 0
        }
        if (selectedChat.value) {
          selectedChat.value.unreadCount = 0
        }
      } catch (error) {
        console.error('Ошибка при отметке чата как прочитанного:', error)
      }
      
      updateLastMessage(chatId)
    } catch (error) {
      console.error(`Ошибка при выборе чата ${chatId}:`, error)
    }
  }

  /**
   * Обновление последнего сообщения в списке чатов
   */
  const updateLastMessage = (chatId) => {
    const chatIndex = chats.value.findIndex(c => c.id === chatId)
    if (chatIndex !== -1 && selectedChat.value && selectedChat.value.messages && selectedChat.value.messages.length > 0) {
      const lastMessage = selectedChat.value.messages[selectedChat.value.messages.length - 1]
      chats.value[chatIndex].lastMessage = lastMessage
    }
  }

  /**
   * Поиск чатов
   */
  const searchChats = () => {
    // Фильтрация происходит через computed filteredChats
  }

  /**
   * Переключение меню чата
   */
  const toggleChatMenu = (chat) => {
    chat.showMenu = !chat.showMenu
  }

  /**
   * Закрепление чата
   */
  const pinChat = async (chat) => {
    try {
      const newPinnedState = !chat.isPinned
      console.log(`[pinChat] Закрепление чата ${chat.id}, новое состояние: ${newPinnedState}`)
      
      const response = await messengerService.togglePinChat(chat.id, newPinnedState)
      
      // Обновляем состояние из ответа сервера
      if (response?.data?.isPinned !== undefined) {
        chat.isPinned = response.data.isPinned
      } else {
        // Fallback если сервер не вернул данные
        chat.isPinned = newPinnedState
      }
      
      chat.showMenu = false
      console.log(`[pinChat] Чат ${chat.id} успешно ${chat.isPinned ? 'закреплён' : 'откреплён'}`)
    } catch (error) {
      console.error('[pinChat] Ошибка при закреплении чата:', error)
    }
  }

  /**
   * Отметить как непрочитанное
   */
  const markAsUnread = async (chat) => {
    try {
      await messengerService.markChatAsUnread(chat.id)
      chat.unreadCount = 1
      chat.showMenu = false
    } catch (error) {
      console.error('Ошибка при отметке чата как непрочитанного:', error)
    }
  }

  /**
   * Отключение уведомлений
   */
  const muteChat = async (chat) => {
    try {
      console.log(`[muteChat] Изменение уведомлений чата ${chat.id}, текущее состояние: ${chat.isMuted}`)
      
      const response = await messengerService.toggleMuteChat(chat.id)
      
      // Обновляем состояние из ответа сервера
      if (response?.data?.isMuted !== undefined) {
        chat.isMuted = response.data.isMuted
      } else {
        // Fallback если сервер не вернул данные
        chat.isMuted = !chat.isMuted
      }
      
      chat.showMenu = false
      console.log(`[muteChat] Уведомления чата ${chat.id}: ${chat.isMuted ? 'отключены' : 'включены'}`)
    } catch (error) {
      console.error('[muteChat] Ошибка при отключении уведомлений:', error)
    }
  }

  /**
   * Покинуть группу
   */
  const leaveGroup = async (chat) => {
    try {
      await messengerService.leaveChat(chat.id)
      chats.value = chats.value.filter(c => c.id !== chat.id)
      selectedChat.value = null
    } catch (error) {
      console.error('Ошибка при покидании группы:', error)
    }
  }

  return {
    chats,
    selectedChat,
    activeTab,
    searchQuery,
    loading,
    chatLoading,
    personalChatsCount,
    groupChatsCount,
    unreadCount,
    filteredChats,
    loadChats,
    selectChat,
    updateLastMessage,
    searchChats,
    toggleChatMenu,
    pinChat,
    markAsUnread,
    muteChat,
    leaveGroup
  }
}
