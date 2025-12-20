import { ref, computed, nextTick } from 'vue'
import messengerService from '@/services/messenger.service'
import { formatMessageText, getUserFullName } from '@/utils/messageFormatters'

/**
 * Composable для работы с сообщениями
 */
export function useMessages(selectedChat, currentUserId) {
  const messagesContainer = ref(null)
  const replyingTo = ref(null)
  const editingMessage = ref(null)
  const editedMessageText = ref('')
  const showEditMessageModal = ref(false)
  const forwardingMessage = ref(null)
  const selectedForwardChatId = ref(null)
  const showForwardMessageModal = ref(false)
  
  // Map для отслеживания уже обработанных сообщений с временными метками
  // Используем Map вместо Set для автоматической очистки старых записей
  const processedMessageIds = new Map()

  /**
   * Группировка сообщений по датам
   */
  const groupedMessages = computed(() => {
    if (!selectedChat.value?.messages) return {}
    
    const sortedMessages = [...(selectedChat.value.messages || [])].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : a.timestamp ? new Date(a.timestamp) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt) : b.timestamp ? new Date(b.timestamp) : new Date(0)
      return dateA.getTime() - dateB.getTime()
    })
    
    const grouped = sortedMessages.reduce((groups, message) => {
      const messageDate = message.createdAt || message.timestamp
      if (!messageDate) return groups
      
      const date = new Date(messageDate)
      const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      
      if (!groups[dateString]) groups[dateString] = []
      groups[dateString].push(message)
      return groups
    }, {})
    
    const sortedGroups = {}
    Object.keys(grouped).sort().forEach(date => {
      sortedGroups[date] = grouped[date]
    })
    
    return sortedGroups
  })

  /**
   * Проверка, является ли сообщение собственным
   */
  const isOwnMessage = (message) => {
    if (!message) return false
    
    let senderId = null
    if (message.senderId) {
      senderId = String(message.senderId).trim()
    } else if (message.sender && message.sender.id) {
      senderId = String(message.sender.id).trim()
    }
    
    if (!senderId) return false
    
    const myId = String(currentUserId.value).trim()
    const localStorageId = localStorage.getItem('userId')
    const fallbackId = localStorageId ? String(localStorageId).trim() : null
    
    return senderId === myId || (fallbackId && senderId === fallbackId)
  }

  /**
   * Загрузка сообщений чата
   */
  const loadMessages = async (chatId) => {
    try {
      const response = await messengerService.getMessages(chatId)
      
      if (response && response.data && selectedChat.value && selectedChat.value.id === chatId) {
        selectedChat.value.messages = response.data
        setTimeout(() => scrollToBottom(), 100)
      }
    } catch (error) {
      console.error(`Ошибка при загрузке сообщений для чата ${chatId}:`, error)
    }
  }

  /**
   * Обновление статуса сообщений как прочитанных
   */
  const markMessagesAsRead = () => {
    if (!selectedChat.value?.messages) return
    
    const myId = String(currentUserId.value).trim()
    
    selectedChat.value.messages = selectedChat.value.messages.map(msg => {
      const senderId = msg.senderId ? String(msg.senderId).trim() : 
                       msg.sender?.id ? String(msg.sender.id).trim() : null
      
      // Обновляем статус только для чужих сообщений
      if (senderId && senderId !== myId && msg.status !== 'read') {
        return { ...msg, status: 'read' }
      }
      return msg
    })
  }

  /**
   * Прокрутка к последнему сообщению
   */
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  /**
   * Прокрутка к конкретному сообщению
   */
  const scrollToMessage = (messageId) => {
    if (!messageId || !messagesContainer.value) return
    
    const messageElement = document.getElementById(`message-${messageId}`)
    
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      messageElement.classList.add('highlighted-message')
      setTimeout(() => {
        messageElement.classList.remove('highlighted-message')
      }, 2000)
    }
  }

  /**
   * Ответ на сообщение
   */
  const replyToMessage = (message) => {
    replyingTo.value = message
  }

  const cancelReply = () => {
    replyingTo.value = null
  }

  /**
   * Редактирование сообщения
   */
  const editMessage = (message) => {
    editingMessage.value = message
    editedMessageText.value = message.text
    showEditMessageModal.value = true
  }

  const cancelEditMessage = () => {
    editingMessage.value = null
    editedMessageText.value = ''
    showEditMessageModal.value = false
  }

  const saveEditedMessage = async () => {
    if (!editingMessage.value || !editedMessageText.value.trim()) return
    
    try {
      await messengerService.editMessage(editingMessage.value.id, editedMessageText.value.trim())
      
      if (selectedChat.value && selectedChat.value.messages) {
        const messageIndex = selectedChat.value.messages.findIndex(
          msg => msg.id === editingMessage.value.id
        )
        
        if (messageIndex !== -1) {
          selectedChat.value.messages[messageIndex].text = editedMessageText.value.trim()
          selectedChat.value.messages[messageIndex].isEdited = true
        }
      }
      
      cancelEditMessage()
    } catch (error) {
      console.error('Ошибка при редактировании сообщения:', error)
    }
  }

  /**
   * Пересылка сообщения
   */
  const forwardMessage = (message) => {
    forwardingMessage.value = message
    selectedForwardChatId.value = null
    showForwardMessageModal.value = true
  }

  const selectChatForForward = (chat) => {
    selectedForwardChatId.value = chat.id
  }

  const cancelForwardMessage = () => {
    forwardingMessage.value = null
    selectedForwardChatId.value = null
    showForwardMessageModal.value = false
  }

  const confirmForwardMessage = async () => {
    if (!forwardingMessage.value || !selectedForwardChatId.value) return
    
    try {
      await messengerService.forwardMessage(
        forwardingMessage.value.id, 
        selectedForwardChatId.value
      )
      
      cancelForwardMessage()
      
      if (selectedChat.value && selectedChat.value.id === selectedForwardChatId.value) {
        await loadMessages(selectedChat.value.id)
      }
    } catch (error) {
      console.error('Ошибка при пересылке сообщения:', error)
    }
  }

  /**
   * Реакции на сообщения
   */
  const showReactions = (message) => {
    // TODO: Реализация показа реакций
  }

  const toggleReaction = async (message, reaction) => {
    try {
      await messengerService.removeReaction(message.id, reaction)
      
      const updatedMessages = selectedChat.value.messages.map(m => 
        m.id === message.id 
          ? { ...m, reactions: { ...m.reactions, [reaction]: Math.max(0, m.reactions[reaction] - 1) } }
          : m
      )
      selectedChat.value.messages = updatedMessages
    } catch (error) {
      console.error('Ошибка при управлении реакцией:', error)
    }
  }

  /**
   * Скачивание файлов
   */
  const downloadFile = (message) => {
    if (!message || (!message.fileUrl && !message.url)) return
    
    const fileUrl = message.fileUrl || message.url
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = message.fileName || 'file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadImage = (message) => {
    if (!message || (!message.fileUrl && !message.url)) return
    
    const imageUrl = message.fileUrl || message.url
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = message.fileName || 'image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Добавление ID в обработанные (защита от дубликатов WebSocket)
   * Используем Map с временными метками для автоматической очистки
   */
  const addProcessedMessageId = (id) => {
    const now = Date.now()
    processedMessageIds.set(id, now)
    
    // Очищаем записи старше 5 минут
    const fiveMinutesAgo = now - 5 * 60 * 1000
    for (const [msgId, timestamp] of processedMessageIds.entries()) {
      if (timestamp < fiveMinutesAgo) {
        processedMessageIds.delete(msgId)
      }
    }
    
    // Дополнительная защита: если больше 200 записей, удаляем самые старые
    if (processedMessageIds.size > 200) {
      const entries = Array.from(processedMessageIds.entries())
        .sort((a, b) => a[1] - b[1])
      
      // Удаляем первую половину (самые старые)
      for (let i = 0; i < entries.length / 2; i++) {
        processedMessageIds.delete(entries[i][0])
      }
    }
  }

  const isMessageProcessed = (id) => processedMessageIds.has(id)
  
  /**
   * Очистка всех обработанных ID (при смене чата)
   */
  const clearProcessedMessageIds = () => {
    processedMessageIds.clear()
  }

  return {
    messagesContainer,
    replyingTo,
    editingMessage,
    editedMessageText,
    showEditMessageModal,
    forwardingMessage,
    selectedForwardChatId,
    showForwardMessageModal,
    groupedMessages,
    isOwnMessage,
    loadMessages,
    scrollToBottom,
    scrollToMessage,
    replyToMessage,
    cancelReply,
    editMessage,
    cancelEditMessage,
    saveEditedMessage,
    forwardMessage,
    selectChatForForward,
    cancelForwardMessage,
    confirmForwardMessage,
    showReactions,
    toggleReaction,
    downloadFile,
    downloadImage,
    addProcessedMessageId,
    isMessageProcessed,
    clearProcessedMessageIds,
    markMessagesAsRead
  }
}
