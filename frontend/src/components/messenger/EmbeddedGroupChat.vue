<template>
  <div class="embedded-chat" :class="{ 'compact': compact }">
    <!-- Header -->
    <div class="embedded-chat-header">
      <div class="chat-title">
        <i class="fas fa-comments"></i>
        <span>{{ title || 'Командный чат' }}</span>
      </div>
      <div class="chat-status" v-if="membersCount > 0">
        <span class="members-count">{{ membersCount }} участников</span>
      </div>
    </div>

    <!-- Messages -->
    <div class="embedded-chat-messages" ref="messagesContainer">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка сообщений...</p>
      </div>
      
      <div v-else-if="!chatId" class="empty-state">
        <i class="fas fa-comments"></i>
        <p>Чат не найден</p>
      </div>
      
      <div v-else-if="messages.length === 0" class="empty-state">
        <i class="fas fa-comment-dots"></i>
        <p>Пока нет сообщений</p>
        <span>Начните общение с командой</span>
      </div>
      
      <template v-else>
        <template v-for="(group, date) in groupedMessages" :key="date">
          <div class="date-separator">
            <span>{{ formatDateLabel(date) }}</span>
          </div>
          <div 
            v-for="message in group" 
            :key="message.id"
            :id="`embedded-msg-${message.id}`"
            class="message-item"
            :class="{ 
              'own': isOwnMessage(message),
              'highlighted': highlightedMessageId === message.id
            }"
          >
            <img 
              :src="getMessageAvatar(message)" 
              :alt="getMessageSenderName(message)"
              class="message-avatar"
              @error="handleAvatarError"
            >
            <div class="message-bubble">
              <!-- Reply preview -->
              <div 
                v-if="message.replyTo" 
                class="reply-preview"
                @click="scrollToMessage(message.replyTo.id)"
              >
                <div class="reply-line"></div>
                <div class="reply-content">
                  <span class="reply-author">{{ getMessageSenderName(message.replyTo) }}</span>
                  <p>{{ message.replyTo.text || 'Сообщение' }}</p>
                </div>
              </div>
              
              <div class="message-header">
                <span class="sender-name">{{ getMessageSenderName(message) }}</span>
              </div>
              
              <!-- Image message -->
              <div v-if="message.type === 'image'" class="message-image" @click="showImagePreview(message)">
                <img :src="message.fileUrl || message.url" :alt="message.fileName || 'Изображение'">
              </div>
              
              <!-- File message -->
              <div v-else-if="message.type === 'file'" class="message-file" @click="downloadFile(message)">
                <i class="fas fa-file"></i>
                <div class="file-info">
                  <span class="file-name">{{ message.fileName || 'Файл' }}</span>
                  <span class="file-size" v-if="message.fileSize">{{ formatFileSize(message.fileSize) }}</span>
                </div>
                <i class="fas fa-download"></i>
              </div>
              
              <!-- Text message -->
              <div v-else class="message-text">{{ message.text }}</div>
              
              <!-- Reactions inside bubble -->
              <div v-if="message.reactions && Object.keys(message.reactions).length > 0" class="message-reactions">
                <button 
                  v-for="(users, emoji) in message.reactions" 
                  :key="emoji"
                  class="reaction-btn"
                  :class="{ 'own-reaction': users.includes(currentUserId) }"
                  @click="toggleReaction(message, emoji)"
                >
                  {{ emoji }} {{ users.length }}
                </button>
              </div>
              
              <!-- Message actions -->
              <div class="message-actions">
                <button @click="replyTo(message)" title="Ответить">
                  <i class="fas fa-reply"></i>
                </button>
                <button @click="showReactionPicker(message)" title="Реакция">
                  <i class="far fa-smile"></i>
                </button>
                <template v-if="isOwnMessage(message)">
                  <button @click="editMessage(message)" title="Редактировать">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteMessage(message)" title="Удалить">
                    <i class="fas fa-trash"></i>
                  </button>
                </template>
              </div>
            </div>
            <!-- Message meta (time) - outside bubble -->
            <div class="message-meta">
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Input -->
    <div class="embedded-chat-input">
      <!-- Reply bar -->
      <div v-if="replyingTo" class="reply-bar">
        <div class="reply-preview-input">
          <div class="reply-line"></div>
          <div class="reply-content">
            <span class="reply-author">{{ getMessageSenderName(replyingTo) }}</span>
            <p>{{ replyingTo.text || 'Сообщение' }}</p>
          </div>
          <button class="close-reply" @click="cancelReply">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="input-row">
        <div class="attach-container">
          <button class="attach-btn" @click="toggleAttachMenu">
            <i class="fas fa-paperclip"></i>
          </button>
          <div v-if="showAttachMenu" class="attach-menu">
            <button @click="attachImage">
              <i class="fas fa-image"></i>
              <span>Изображение</span>
            </button>
            <button @click="attachFile">
              <i class="fas fa-file"></i>
              <span>Файл</span>
            </button>
          </div>
        </div>
        
        <div class="input-wrapper">
          <textarea
            ref="inputRef"
            v-model="newMessage"
            @keydown.enter.exact.prevent="sendMessage"
            @input="handleTyping"
            placeholder="Введите сообщение..."
            rows="1"
          ></textarea>
          <button class="emoji-btn" @click="toggleEmojiPicker">
            <i class="far fa-smile"></i>
          </button>
        </div>
        
        <button 
          class="send-btn" 
          :class="{ 'enabled': canSend }"
          @click="sendMessage"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      
      <!-- Emoji picker -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-list">
          <button 
            v-for="emoji in quickEmojis" 
            :key="emoji"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>

    <!-- File upload modal -->
    <div v-if="showFileUploadModal" class="file-upload-modal" @click.self="cancelFileUpload">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isImageUpload ? 'Загрузка изображения' : 'Загрузка файла' }}</h3>
          <button @click="cancelFileUpload"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div 
            class="drop-zone"
            :class="{ 'drag-over': dragOver }"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleFileDrop"
          >
            <div v-if="selectedFile" class="file-preview">
              <img v-if="isImageUpload && filePreviewUrl" :src="filePreviewUrl" alt="Preview">
              <div v-else class="file-icon">
                <i class="fas fa-file"></i>
                <span>{{ selectedFile.name }}</span>
              </div>
              <button class="remove-file" @click="removeSelectedFile">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div v-else class="drop-placeholder">
              <i :class="isImageUpload ? 'fas fa-image' : 'fas fa-file'"></i>
              <p>Перетащите файл сюда или</p>
              <label class="file-select-btn">
                Выберите файл
                <input 
                  type="file" 
                  :accept="isImageUpload ? 'image/*' : '*'"
                  @change="handleFileSelect"
                  hidden
                >
              </label>
            </div>
          </div>
          <div v-if="uploadInProgress" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span>{{ uploadProgress }}%</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelFileUpload">Отмена</button>
          <button 
            class="btn-primary" 
            @click="uploadSelectedFile"
            :disabled="!selectedFile || uploadInProgress"
          >
            {{ uploadInProgress ? 'Загрузка...' : 'Отправить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image preview modal -->
    <div v-if="showImagePreviewModal" class="image-preview-modal" @click.self="showImagePreviewModal = false">
      <div class="preview-content">
        <button class="close-preview" @click="showImagePreviewModal = false">
          <i class="fas fa-times"></i>
        </button>
        <img :src="previewImageUrl" alt="Preview">
        <button class="download-btn" @click="downloadPreviewImage">
          <i class="fas fa-download"></i>
          Скачать
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import messengerService from '@/services/messenger.service'
import websocketService from '@/services/websocket.service'

export default {
  name: 'EmbeddedGroupChat',
  props: {
    chatId: {
      type: [Number, String],
      default: null
    },
    title: {
      type: String,
      default: 'Командный чат'
    },
    membersCount: {
      type: Number,
      default: 0
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['message-sent', 'error'],
  setup(props, { emit }) {
    // State
    const loading = ref(false)
    const messages = ref([])
    const newMessage = ref('')
    const replyingTo = ref(null)
    const currentUserId = ref(parseInt(localStorage.getItem('userId')))
    const messagesContainer = ref(null)
    const inputRef = ref(null)
    const highlightedMessageId = ref(null)
    
    // Attach menu
    const showAttachMenu = ref(false)
    const showEmojiPicker = ref(false)
    
    // File upload
    const showFileUploadModal = ref(false)
    const isImageUpload = ref(false)
    const selectedFile = ref(null)
    const filePreviewUrl = ref('')
    const uploadProgress = ref(0)
    const uploadInProgress = ref(false)
    const dragOver = ref(false)
    
    // Image preview
    const showImagePreviewModal = ref(false)
    const previewImageUrl = ref('')
    const previewMessage = ref(null)
    
    // Typing
    const isTyping = ref(false)
    const typingTimeout = ref(null)
    
    // Reaction picker
    const reactionPickerMessage = ref(null)
    
    // WebSocket unsubscribers
    const wsUnsubscribers = []
    
    // Quick emojis
    const quickEmojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '💪', '✅', '👀']

    // Computed
    const canSend = computed(() => newMessage.value.trim().length > 0)
    
    const groupedMessages = computed(() => {
      if (!messages.value.length) return {}
      
      const sorted = [...messages.value].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0)
        const dateB = new Date(b.createdAt || b.timestamp || 0)
        return dateA - dateB
      })
      
      return sorted.reduce((groups, message) => {
        const date = new Date(message.createdAt || message.timestamp)
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(message)
        return groups
      }, {})
    })

    // Methods
    const loadMessages = async () => {
      if (!props.chatId) return
      
      loading.value = true
      try {
        const response = await messengerService.getMessages(props.chatId)
        if (response?.data) {
          messages.value = response.data
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        console.error('[EmbeddedChat] Error loading messages:', error)
        emit('error', error)
      } finally {
        loading.value = false
      }
    }

    const sendMessage = async () => {
      if (!canSend.value || !props.chatId) return
      
      const text = newMessage.value.trim()
      newMessage.value = ''
      
      // Temp message
      const tempId = `temp-${Date.now()}`
      const tempMessage = {
        id: tempId,
        text,
        senderId: currentUserId.value,
        chatId: props.chatId,
        createdAt: new Date().toISOString(),
        status: 'sending',
        sender: { id: currentUserId.value },
        replyTo: replyingTo.value ? { ...replyingTo.value } : null,
        _isTemp: true
      }
      
      messages.value.push(tempMessage)
      const savedReplyTo = replyingTo.value
      replyingTo.value = null
      
      await nextTick()
      scrollToBottom()
      
      try {
        const messageData = {
          chatId: Number(props.chatId),
          text,
          type: 'text'
        }
        
        if (savedReplyTo) {
          messageData.replyToId = savedReplyTo.id
        }
        
        const response = await messengerService.sendMessage(messageData)
        
        if (response?.data) {
          // Replace temp message
          const index = messages.value.findIndex(m => m.id === tempId)
          if (index !== -1) {
            messages.value[index] = response.data
          }
          emit('message-sent', response.data)
        }
      } catch (error) {
        console.error('[EmbeddedChat] Error sending message:', error)
        // Mark as error
        const msg = messages.value.find(m => m.id === tempId)
        if (msg) msg.status = 'error'
        emit('error', error)
      }
    }

    const isOwnMessage = (message) => {
      const senderId = message.senderId || message.sender?.id
      return String(senderId) === String(currentUserId.value)
    }

    const getMessageSenderName = (message) => {
      if (!message) return 'Пользователь'
      const sender = message.sender
      if (!sender) return 'Пользователь'
      
      const name = [sender.firstName, sender.lastName].filter(Boolean).join(' ')
      return name || sender.name || `Пользователь ${sender.id}`
    }

    const getMessageAvatar = (message) => {
      const sender = message?.sender
      if (!sender) return '/assets/images/default-avatar.svg'
      
      const avatar = sender.profile?.avatar || sender.avatar
      if (!avatar) return '/assets/images/default-avatar.svg'
      if (avatar.startsWith('data:') || avatar.startsWith('http')) return avatar
      return avatar.startsWith('/') ? avatar : `/${avatar}`
    }

    const handleAvatarError = (e) => {
      e.target.src = '/assets/images/default-avatar.svg'
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }

    const formatDateLabel = (dateKey) => {
      const [year, month, day] = dateKey.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) return 'Сегодня'
      if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
      
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    }

    const formatFileSize = (bytes) => {
      if (!bytes) return ''
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const scrollToMessage = (messageId) => {
      if (!messageId) return
      const el = document.getElementById(`embedded-msg-${messageId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        highlightedMessageId.value = messageId
        setTimeout(() => { highlightedMessageId.value = null }, 2000)
      }
    }

    // Reply
    const replyTo = (message) => {
      replyingTo.value = message
      inputRef.value?.focus()
    }

    const cancelReply = () => {
      replyingTo.value = null
    }

    // Reactions
    const showReactionPicker = (message) => {
      reactionPickerMessage.value = message
      showEmojiPicker.value = true
    }

    const toggleReaction = async (message, emoji) => {
      try {
        const hasReaction = message.reactions?.[emoji]?.includes(currentUserId.value)
        
        if (hasReaction) {
          await messengerService.removeReaction(message.id, emoji)
          if (message.reactions[emoji]) {
            message.reactions[emoji] = message.reactions[emoji].filter(id => id !== currentUserId.value)
            if (message.reactions[emoji].length === 0) delete message.reactions[emoji]
          }
        } else {
          await messengerService.addReaction(message.id, emoji)
          if (!message.reactions) message.reactions = {}
          if (!message.reactions[emoji]) message.reactions[emoji] = []
          message.reactions[emoji].push(currentUserId.value)
        }
      } catch (error) {
        console.error('[EmbeddedChat] Error toggling reaction:', error)
      }
    }

    // Edit/Delete
    const editMessage = async (message) => {
      const newText = prompt('Редактировать сообщение:', message.text)
      if (newText && newText.trim() && newText !== message.text) {
        try {
          await messengerService.editMessage(message.id, newText.trim())
          message.text = newText.trim()
          message.isEdited = true
        } catch (error) {
          console.error('[EmbeddedChat] Error editing message:', error)
        }
      }
    }

    const deleteMessage = async (message) => {
      if (!confirm('Удалить сообщение?')) return
      try {
        await messengerService.deleteMessage(message.id)
        messages.value = messages.value.filter(m => m.id !== message.id)
      } catch (error) {
        console.error('[EmbeddedChat] Error deleting message:', error)
      }
    }

    // File upload
    const toggleAttachMenu = () => {
      showAttachMenu.value = !showAttachMenu.value
      showEmojiPicker.value = false
    }

    const attachImage = () => {
      isImageUpload.value = true
      showFileUploadModal.value = true
      showAttachMenu.value = false
    }

    const attachFile = () => {
      isImageUpload.value = false
      showFileUploadModal.value = true
      showAttachMenu.value = false
    }

    const handleFileSelect = (e) => {
      const file = e.target.files[0]
      if (!file) return
      selectedFile.value = file
      if (isImageUpload.value && file.type.startsWith('image/')) {
        filePreviewUrl.value = URL.createObjectURL(file)
      }
    }

    const handleFileDrop = (e) => {
      dragOver.value = false
      const file = e.dataTransfer.files[0]
      if (!file) return
      if (isImageUpload.value && !file.type.startsWith('image/')) {
        alert('Пожалуйста, загрузите изображение')
        return
      }
      selectedFile.value = file
      if (isImageUpload.value && file.type.startsWith('image/')) {
        filePreviewUrl.value = URL.createObjectURL(file)
      }
    }

    const removeSelectedFile = () => {
      if (filePreviewUrl.value) URL.revokeObjectURL(filePreviewUrl.value)
      selectedFile.value = null
      filePreviewUrl.value = ''
    }

    const cancelFileUpload = () => {
      removeSelectedFile()
      showFileUploadModal.value = false
      uploadProgress.value = 0
    }

    const uploadSelectedFile = async () => {
      if (!selectedFile.value || !props.chatId) return
      
      uploadInProgress.value = true
      try {
        const uploadMethod = isImageUpload.value 
          ? messengerService.uploadImage 
          : messengerService.uploadFile
        
        const response = await uploadMethod(selectedFile.value, (progress) => {
          uploadProgress.value = progress
        })
        
        const fileUrl = response.data.url
        
        await messengerService.sendMessage({
          chatId: props.chatId,
          text: isImageUpload.value ? 'Изображение' : selectedFile.value.name,
          type: isImageUpload.value ? 'image' : 'file',
          fileUrl,
          fileName: selectedFile.value.name,
          fileSize: selectedFile.value.size
        })
        
        cancelFileUpload()
        await loadMessages()
      } catch (error) {
        console.error('[EmbeddedChat] Error uploading file:', error)
        emit('error', error)
      } finally {
        uploadInProgress.value = false
        uploadProgress.value = 0
      }
    }

    // Image preview
    const showImagePreview = (message) => {
      previewImageUrl.value = message.fileUrl || message.url
      previewMessage.value = message
      showImagePreviewModal.value = true
    }

    const downloadPreviewImage = () => {
      if (!previewImageUrl.value) return
      const link = document.createElement('a')
      link.href = previewImageUrl.value
      link.download = previewMessage.value?.fileName || 'image.jpg'
      link.click()
    }

    const downloadFile = (message) => {
      const url = message.fileUrl || message.url
      if (!url) return
      const link = document.createElement('a')
      link.href = url
      link.download = message.fileName || 'file'
      link.click()
    }

    // Emoji
    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
      showAttachMenu.value = false
    }

    const insertEmoji = (emoji) => {
      if (reactionPickerMessage.value) {
        toggleReaction(reactionPickerMessage.value, emoji)
        reactionPickerMessage.value = null
      } else {
        newMessage.value += emoji
      }
      showEmojiPicker.value = false
    }

    // Typing
    const handleTyping = () => {
      if (!isTyping.value && props.chatId) {
        isTyping.value = true
        websocketService.sendTyping(props.chatId, true)
      }
      
      clearTimeout(typingTimeout.value)
      typingTimeout.value = setTimeout(() => {
        isTyping.value = false
        if (props.chatId) {
          websocketService.sendTyping(props.chatId, false)
        }
      }, 2000)
    }

    // WebSocket setup
    const setupWebSocket = () => {
      if (!props.chatId) return
      
      websocketService.joinChat(props.chatId)
      
      const unsubNewMessage = websocketService.on('chat:newMessage', (message) => {
        if (message.chatId !== Number(props.chatId)) return
        if (String(message.senderId) === String(currentUserId.value)) return
        
        // Check for duplicates
        if (!messages.value.some(m => m.id === message.id)) {
          messages.value.push(message)
          nextTick(() => scrollToBottom())
        }
      })
      wsUnsubscribers.push(unsubNewMessage)
      
      const unsubEdited = websocketService.on('chat:messageEdited', (message) => {
        if (message.chatId !== Number(props.chatId)) return
        const index = messages.value.findIndex(m => m.id === message.id)
        if (index !== -1) {
          messages.value[index] = { ...messages.value[index], ...message }
        }
      })
      wsUnsubscribers.push(unsubEdited)
      
      const unsubDeleted = websocketService.on('chat:messageDeleted', (data) => {
        if (data.chatId !== Number(props.chatId)) return
        messages.value = messages.value.filter(m => m.id !== data.messageId)
      })
      wsUnsubscribers.push(unsubDeleted)
    }

    const cleanupWebSocket = () => {
      wsUnsubscribers.forEach(unsub => unsub())
      wsUnsubscribers.length = 0
      if (props.chatId) {
        websocketService.leaveChat(props.chatId)
      }
    }

    // Watch chatId changes
    watch(() => props.chatId, (newId, oldId) => {
      if (oldId) {
        websocketService.leaveChat(oldId)
      }
      if (newId) {
        loadMessages()
        setupWebSocket()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.chatId) {
        loadMessages()
        setupWebSocket()
      }
    })

    onUnmounted(() => {
      cleanupWebSocket()
      clearTimeout(typingTimeout.value)
    })

    return {
      // State
      loading,
      messages,
      newMessage,
      replyingTo,
      currentUserId,
      messagesContainer,
      inputRef,
      highlightedMessageId,
      showAttachMenu,
      showEmojiPicker,
      showFileUploadModal,
      isImageUpload,
      selectedFile,
      filePreviewUrl,
      uploadProgress,
      uploadInProgress,
      dragOver,
      showImagePreviewModal,
      previewImageUrl,
      quickEmojis,
      
      // Computed
      canSend,
      groupedMessages,
      
      // Methods
      sendMessage,
      isOwnMessage,
      getMessageSenderName,
      getMessageAvatar,
      handleAvatarError,
      formatTime,
      formatDateLabel,
      formatFileSize,
      scrollToBottom,
      scrollToMessage,
      replyTo,
      cancelReply,
      showReactionPicker,
      toggleReaction,
      editMessage,
      deleteMessage,
      toggleAttachMenu,
      attachImage,
      attachFile,
      handleFileSelect,
      handleFileDrop,
      removeSelectedFile,
      cancelFileUpload,
      uploadSelectedFile,
      showImagePreview,
      downloadPreviewImage,
      downloadFile,
      toggleEmojiPicker,
      insertEmoji,
      handleTyping
    }
  }
}
</script>


<style scoped>
.embedded-chat {
  display: flex;
  flex-direction: column;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.embedded-chat.compact {
  height: 400px;
}

/* Header */
.embedded-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.chat-title i {
  font-size: 18px;
}

.chat-status {
  font-size: 13px;
  opacity: 0.85;
}

/* Messages */
.embedded-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.embedded-chat-messages::-webkit-scrollbar {
  width: 6px;
}

.embedded-chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
}

.loading-state .spinner,
.empty-state i {
  font-size: 40px;
  margin-bottom: 12px;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state p {
  margin: 0;
  font-weight: 500;
}

.empty-state span {
  font-size: 13px;
  margin-top: 4px;
}

/* Date separator */
.date-separator {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.date-separator span {
  background: #e2e8f0;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Message item */
.message-item {
  display: flex;
  gap: 10px;
  max-width: 85%;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item.own {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-item.highlighted .message-bubble {
  animation: highlight 2s ease;
}

@keyframes highlight {
  0%, 100% { background: inherit; }
  50% { background: #fef3c7; }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-bubble {
  background: #fff;
  border-radius: 16px;
  padding: 10px 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  min-width: 100px;
  display: inline-block;
  max-width: 100%;
}

.message-item.own {
  align-items: flex-end;
}

.message-item.own .message-bubble {
  background: #eff6ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.sender-name {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
}

.message-item.own .sender-name {
  color: #1d4ed8;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
  word-break: break-word;
}

/* Reply preview in message */
.reply-preview {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  overflow: hidden;
}

.reply-preview:hover {
  background: #e2e8f0;
}

.reply-line {
  width: 3px;
  background: #2563eb;
  flex-shrink: 0;
}

.reply-content {
  padding: 6px 10px;
  min-width: 0;
  flex: 1;
}

.reply-author {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
}

.reply-content p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Image message */
.message-image {
  margin-top: 8px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.message-image img {
  max-width: 250px;
  max-height: 200px;
  object-fit: cover;
  display: block;
}

/* File message */
.message-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f1f5f9;
  border-radius: 8px;
  margin-top: 8px;
  cursor: pointer;
}

.message-file:hover {
  background: #e2e8f0;
}

.message-file > i:first-child {
  font-size: 24px;
  color: #2563eb;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #94a3b8;
}

.message-file > i:last-child {
  color: #64748b;
}

/* Reactions */
.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.reaction-btn {
  background: #f1f5f9;
  border: none;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-btn:hover {
  background: #e2e8f0;
}

.reaction-btn.own-reaction {
  background: #dbeafe;
  border: 1px solid #93c5fd;
}

/* Message actions */
.message-actions {
  display: none;
  position: absolute;
  top: -8px;
  right: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.message-bubble:hover .message-actions {
  display: flex;
}

.message-actions button {
  background: none;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 4px;
  font-size: 12px;
}

.message-actions button:hover {
  background: #f1f5f9;
  color: #2563eb;
}

/* Input area */
.embedded-chat-input {
  background: #fff;
  border-top: 1px solid #e2e8f0;
  position: relative;
}

.reply-bar {
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.reply-preview-input {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.close-reply {
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  color: #94a3b8;
}

.close-reply:hover {
  color: #ef4444;
  background: #fef2f2;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
}

.attach-container {
  position: relative;
}

.attach-btn {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  color: #64748b;
  border-radius: 50%;
}

.attach-btn:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.attach-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  margin-bottom: 8px;
  z-index: 10;
}

.attach-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  color: #334155;
  font-size: 14px;
  white-space: nowrap;
  width: 100%;
}

.attach-menu button:hover {
  background: #f1f5f9;
}

.attach-menu button i {
  color: #2563eb;
  width: 20px;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  background: #f1f5f9;
  border-radius: 24px;
  padding: 4px 12px;
}

.input-wrapper textarea {
  flex: 1;
  border: none;
  background: none;
  padding: 10px 8px;
  font-size: 14px;
  resize: none;
  max-height: 100px;
  line-height: 1.4;
  color: #334155;
}

.input-wrapper textarea:focus {
  outline: none;
}

.input-wrapper textarea::placeholder {
  color: #94a3b8;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #94a3b8;
}

.emoji-btn:hover {
  color: #2563eb;
}

.send-btn {
  background: #e2e8f0;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn.enabled {
  background: #2563eb;
  color: #fff;
}

.send-btn.enabled:hover {
  background: #1d4ed8;
}

/* Emoji picker */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px;
  margin-bottom: 8px;
  z-index: 10;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.emoji-list button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 20px;
}

.emoji-list button:hover {
  background: #f1f5f9;
}

/* File upload modal */
.file-upload-modal,
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.modal-header button {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
}

.modal-body {
  padding: 20px;
}

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.2s;
}

.drop-zone.drag-over {
  border-color: #2563eb;
  background: #eff6ff;
}

.drop-placeholder i {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.drop-placeholder p {
  color: #64748b;
  margin: 0 0 12px;
}

.file-select-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #2563eb;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.file-select-btn:hover {
  background: #1d4ed8;
}

.file-preview {
  position: relative;
}

.file-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-icon i {
  font-size: 48px;
  color: #2563eb;
}

.remove-file {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: #fff;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.upload-progress {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Image preview modal */
.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.preview-content img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
}

.close-preview {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: #334155;
}

.download-btn {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
}

.download-btn:hover {
  background: #f1f5f9;
}
</style>
