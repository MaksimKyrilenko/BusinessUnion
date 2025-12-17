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
  
  // Set для отслеживания уже обработанных сообщений
  const processedMessageIds = new Set()

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
   */
  const addProcessedMessageId = (id) => {
    processedMessageIds.add(id)
    
    // Очищаем старые ID (храним только последние 100)
    if (processedMessageIds.size > 100) {
      const idsArray = Array.from(processedMessageIds)
      for (let i = 0; i < 50; i++) {
        processedMessageIds.delete(idsArray[i])
      }
    }
  }

  const isMessageProcessed = (id) => processedMessageIds.has(id)

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
    isMessageProcessed
  }
}
