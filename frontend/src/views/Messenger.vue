<template>
  <div class="messenger">
    <div class="messenger-sidebar">
      <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск чатов..."
          @input="searchChats"
        >
        </div>

      <div class="chat-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'personal' }]"
          @click="activeTab = 'personal'"
        >
          Личные
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'group' }]"
          @click="activeTab = 'group'"
        >
          Групповые
        </button>
      </div>

      <div class="chat-list">
          <div
            v-for="chat in filteredChats"
            :key="chat.id"
          :class="['chat-item', { active: selectedChat?.id === chat.id }]"
            @click="selectChat(chat)"
          >
            <div class="chat-avatar">
            <img :src="chat.avatar || '/default-avatar.png'" :alt="chat.name">
            <span class="status-indicator" :class="chat.status"></span>
            </div>
            <div class="chat-info">
            <div class="chat-header">
              <div class="chat-title">
                <h3>{{ chat.name }}</h3>
                <span v-if="chat.isPinned" class="pin-indicator" title="Закреплённый чат">📌</span>
            </div>
              <span class="chat-time">{{ formatTime(chat.lastMessage?.timestamp) }}</span>
            </div>
            <p class="chat-preview">
              <span v-if="chat.lastMessage?.type === 'image'" class="message-type-indicator">📷 Фото</span>
              <span v-else-if="chat.lastMessage?.type === 'file'" class="message-type-indicator">📎 Файл</span>
              <span v-else>{{ chat.lastMessage?.text || 'Нет сообщений' }}</span>
            </p>
            <div class="chat-meta">
              <span v-if="chat.typing" class="typing-indicator">печатает...</span>
              <span v-if="chat.unreadCount" class="unread-badge">{{ chat.unreadCount }}</span>
              </div>
          </div>
          <div class="chat-actions-menu">
            <button class="action-btn" @click.stop="toggleChatMenu(chat)">⋮</button>
            <div v-if="chat.showMenu" class="chat-menu">
              <button @click.stop="pinChat(chat)">
                {{ chat.isPinned ? 'Открепить' : 'Закрепить' }}
              </button>
              <button @click.stop="markAsUnread(chat)">
                Отметить как непрочитанное
              </button>
              <button @click.stop="muteChat(chat)">
                {{ chat.isMuted ? 'Включить уведомления' : 'Отключить уведомления' }}
              </button>
              <button v-if="chat.type === 'group'" @click.stop="leaveGroup(chat)" class="danger">
                Покинуть группу
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="create-group" v-if="activeTab === 'group'">
        <button class="create-group-btn" @click="showCreateGroupModal = true">
          <i class="fas fa-plus"></i> Создать группу
        </button>
      </div>
    </div>

    <div class="messenger-main" v-if="selectedChat">
      <div class="main-chat-header">
        <div class="chat-info">
          <img :src="selectedChat.avatar || '/default-avatar.png'" :alt="selectedChat.name">
          <div>
            <h2>{{ selectedChat.name }}</h2>
            <span class="status">{{ selectedChat.status === 'online' ? 'В сети' : 'Не в сети' }}</span>
          </div>
          </div>
          <div class="chat-actions">
          <button v-if="selectedChat.type === 'group'" @click="showGroupInfo = true">
              <i class="fas fa-info-circle"></i>
            </button>
          <button @click="showChatSettings = true">
            <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
        <div class="date-separator" v-for="(group, date) in groupedMessages" :key="date">
          <span class="date-label">{{ formatDate(date) }}</span>
          <div
            v-for="message in group" 
            :key="message.id"
            :class="['message', { 
              'message-own': message.senderId === currentUserId,
              'message-replied': message.replyTo
            }]"
          >
            <div v-if="!isOwnMessage(message)" class="message-avatar">
              <img :src="message.sender.avatar || '/default-avatar.png'" :alt="message.sender.name">
            </div>
            <div class="message-content">
              <div v-if="message.replyTo" class="message-reply-preview" @click="scrollToMessage(message.replyTo.id)">
                <div class="reply-content">
                  <span class="reply-author">{{ message.replyTo.sender.name }}</span>
                  <p>{{ message.replyTo.text }}</p>
            </div>
            </div>
              <div class="message-bubble">
                <div v-if="!isOwnMessage(message)" class="message-author">
                  {{ message.sender.name }}
                </div>
                <div v-if="message.type === 'text'" class="message-text" v-html="formatMessageText(message.text)"></div>
                <div v-else-if="message.type === 'image'" class="message-image">
                  <img :src="message.url" @click="showImagePreview(message)">
                </div>
                <div v-else-if="message.type === 'file'" class="message-file">
                  <div class="file-info">
                    <i class="fas fa-file"></i>
                    <div class="file-details">
                      <span class="file-name">{{ message.fileName }}</span>
                      <span class="file-size">{{ formatFileSize(message.size) }}</span>
                    </div>
                  </div>
                  <button @click="downloadFile(message)" class="download-btn">
                    <i class="fas fa-download"></i>
                  </button>
                </div>
              </div>
              <div class="message-meta">
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                <div class="message-actions">
                  <button class="action-btn" @click="showReactions(message)">
                    <i class="far fa-smile"></i>
                  </button>
                  <button class="action-btn" @click="replyToMessage(message)">
                    <i class="fas fa-reply"></i>
                  </button>
                  <button v-if="isOwnMessage(message)" class="action-btn" @click="editMessage(message)">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
                <div v-if="message.reactions" class="message-reactions">
                  <div 
                    v-for="(count, reaction) in message.reactions" 
                    :key="reaction"
                    class="reaction-badge"
                    @click="toggleReaction(message, reaction)"
                  >
                    {{ reaction }} {{ count }}
                  </div>
                </div>
                <span v-if="isOwnMessage(message)" class="message-status">
                  <i :class="['fas', getStatusIcon(message.status)]"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="replyingTo" class="reply-bar">
        <div class="reply-preview">
          <div class="reply-content">
            <span class="reply-author">{{ replyingTo.sender.name }}</span>
            <p>{{ replyingTo.text }}</p>
          </div>
          <button class="close-reply" @click="cancelReply">×</button>
          </div>
        </div>

        <div class="message-input">
        <button class="attach-btn" @click="showAttachMenu = true">
          <i class="fas fa-paperclip"></i>
        </button>
        <div class="input-wrapper">
          <textarea
            v-model="newMessage"
            placeholder="Введите сообщение..."
            @keydown.enter.prevent="sendMessage"
            @input="handleInput"
            rows="1"
            ref="messageInput"
          ></textarea>
          <div class="format-toolbar" v-if="showFormatting">
            <button @click="formatText('bold')" title="Жирный">B</button>
            <button @click="formatText('italic')" title="Курсив">I</button>
            <button @click="formatText('code')" title="Код">{}</button>
          </div>
          <button class="emoji-btn" @click="showEmojiPicker = true">
            <i class="far fa-smile"></i>
          </button>
        </div>
        <button class="send-btn" @click="sendMessage" :disabled="!canSendMessage">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>

      <div v-if="showAttachMenu" class="attach-menu">
        <div class="attach-options">
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

      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-categories">
          <button
            v-for="category in emojiCategories" 
            :key="category.name"
            @click="selectEmojiCategory(category)"
          >
            {{ category.icon }}
          </button>
        </div>
        <div class="emoji-list">
          <button 
            v-for="emoji in currentCategoryEmojis" 
            :key="emoji"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
        </div>
      </div>

    <div class="messenger-placeholder" v-else>
      <div class="placeholder-content">
        <i class="fas fa-comments"></i>
        <h2>Выберите чат для начала общения</h2>
      </div>
    </div>

    <!-- Модальные окна -->
    <modal v-if="showCreateGroupModal" @close="showCreateGroupModal = false">
      <div class="create-group-modal">
        <div class="modal-header">
          <h3>Создание группы</h3>
        </div>
        <form @submit.prevent="createGroup" class="create-group-form">
          <div class="form-group">
            <label>Название группы</label>
            <div class="input-wrapper">
              <i class="fas fa-users"></i>
              <input 
                v-model="newGroup.name" 
                type="text" 
                placeholder="Введите название группы"
                required
              >
            </div>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <div class="input-wrapper">
              <i class="fas fa-info-circle"></i>
              <textarea 
                v-model="newGroup.description"
                placeholder="Добавьте описание группы"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="form-group">
            <label>Участники</label>
            <div class="selected-users-container">
              <div class="selected-users" v-if="newGroup.users.length">
                <div v-for="user in newGroup.users" :key="user.id" class="selected-user">
                  <img :src="user.avatar || '/default-avatar.png'" :alt="user.name">
                  <span>{{ user.name }}</span>
                  <button @click="removeUser(user)" class="remove-user">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div v-else class="no-users-selected">
                <i class="fas fa-users"></i>
                Выберите участников группы
              </div>
            </div>
            <div class="search-users-container">
              <div class="input-wrapper">
                <i class="fas fa-search"></i>
                <input 
                  type="text" 
                  v-model="userSearch" 
                  @input="searchUsers" 
                  placeholder="Поиск пользователей..."
                >
              </div>
              <div v-if="searchResults.length" class="search-results">
                <div 
                  v-for="user in searchResults" 
                  :key="user.id"
                  class="search-result"
                  @click="addUser(user)"
                >
                  <img :src="user.avatar || '/default-avatar.png'" :alt="user.name">
                  <div class="user-info">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-role">{{ user.role }}</span>
                  </div>
                  <button class="add-user">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div v-else-if="userSearch && !searchResults.length" class="no-results">
                <i class="fas fa-search"></i>
                Пользователи не найдены
              </div>
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateGroupModal = false">
            <i class="fas fa-times"></i>
            Отмена
          </button>
          <button 
            class="btn-primary create-btn" 
            @click="createGroup"
            :disabled="!newGroup.name || newGroup.users.length < 2"
          >
            <i class="fas fa-check"></i>
            Создать
          </button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import Modal from '@/components/ui/Modal.vue'
import api from '@/axios'

export default {
  name: 'Messenger',
  components: {
    Modal
  },
  setup() {
    const userStore = useUserStore()
    const currentUserId = ref(userStore.userId)
    
    const activeTab = ref('personal')
    const searchQuery = ref('')
    const chats = ref([])
    const selectedChat = ref(null)
    const newMessage = ref('')
    const showCreateGroupModal = ref(false)
    const showAttachMenu = ref(false)
    const showEmojiPicker = ref(false)
    const messagesContainer = ref(null)
    
    const newGroup = ref({
      name: '',
      description: '',
      users: []
    })
    
    const userSearch = ref('')
    const searchResults = ref([])

    const replyingTo = ref(null)
    const showFormatting = ref(false)
    const emojiCategories = ref([
      { name: 'smileys', icon: '😊' },
      { name: 'gestures', icon: '👋' },
      { name: 'objects', icon: '💡' },
      { name: 'symbols', icon: '❤️' }
    ])
    const currentEmojiCategory = ref('smileys')

    const filteredChats = computed(() => {
      return chats.value
        .filter(chat => 
          (activeTab.value === 'personal' ? !chat.isGroup : chat.isGroup) &&
          chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .sort((a, b) => {
          const timeA = a.lastMessage?.timestamp || 0
          const timeB = b.lastMessage?.timestamp || 0
          return timeB - timeA
        })
    })

    const loadChats = async () => {
      try {
        const response = await api.get('/chats')
        chats.value = response.data
      } catch (error) {
        console.error('Ошибка при загрузке чатов:', error)
      }
    }

    const selectChat = async (chat) => {
      selectedChat.value = chat
      if (chat.unreadCount > 0) {
        try {
          await api.post(`/chats/${chat.id}/read`)
          chat.unreadCount = 0
      } catch (error) {
          console.error('Ошибка при отметке сообщений как прочитанных:', error)
        }
      }
      await nextTick()
      scrollToBottom()
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return

      try {
        const message = {
          chatId: selectedChat.value.id,
          text: newMessage.value,
          type: 'text',
          timestamp: Date.now()
        }

        const response = await api.post('/messages', message)
        selectedChat.value.messages.push(response.data)
        newMessage.value = ''
        
        await nextTick()
        scrollToBottom()
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
      }
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      if (isToday) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }
      
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }

    const searchUsers = async () => {
      if (!userSearch.value.trim()) {
        searchResults.value = []
        return
      }

      try {
        const response = await api.get(`/users/search?q=${userSearch.value}`)
        searchResults.value = response.data.filter(user => 
          !newGroup.value.users.some(selected => selected.id === user.id)
        )
      } catch (error) {
        console.error('Ошибка при поиске пользователей:', error)
      }
    }

    const addUser = (user) => {
      newGroup.value.users.push(user)
      searchResults.value = searchResults.value.filter(u => u.id !== user.id)
      userSearch.value = ''
    }

    const removeUser = (user) => {
      newGroup.value.users = newGroup.value.users.filter(u => u.id !== user.id)
    }

    const createGroup = async () => {
      if (!newGroup.value.name.trim() || newGroup.value.users.length < 2) return

      try {
        const response = await api.post('/chats/group', {
          name: newGroup.value.name,
          description: newGroup.value.description,
          userIds: newGroup.value.users.map(u => u.id)
        })

        chats.value.unshift(response.data)
        showCreateGroupModal.value = false
        newGroup.value = { name: '', description: '', users: [] }
      } catch (error) {
        console.error('Ошибка при создании группы:', error)
      }
    }

    const groupedMessages = computed(() => {
      if (!selectedChat.value?.messages) return {}
      
      return selectedChat.value.messages.reduce((groups, message) => {
        const date = new Date(message.timestamp).toLocaleDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(message)
        return groups
      }, {})
    })

    const canSendMessage = computed(() => {
      return newMessage.value.trim() || attachments.value.length > 0
    })

    const handleInput = (event) => {
      const textarea = event.target
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
      
      // Отправка события печатания
      if (!isTyping.value) {
        isTyping.value = true
        sendTypingStatus(true)
        setTimeout(() => {
          isTyping.value = false
          sendTypingStatus(false)
        }, 2000)
      }
    }

    const formatText = (type) => {
      const textarea = messageInput.value
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = newMessage.value
      
      let prefix, suffix
      switch (type) {
        case 'bold':
          prefix = '**'
          suffix = '**'
          break
        case 'italic':
          prefix = '_'
          suffix = '_'
          break
        case 'code':
          prefix = '`'
          suffix = '`'
          break
      }
      
      newMessage.value = text.substring(0, start) + prefix + 
        text.substring(start, end) + suffix + 
        text.substring(end)
    }

    const formatMessageText = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    }

    const replyToMessage = (message) => {
      replyingTo.value = message
      messageInput.value?.focus()
    }

    const cancelReply = () => {
      replyingTo.value = null
    }

    const sendTypingStatus = async (isTyping) => {
      try {
        await api.post(`/chats/${selectedChat.value.id}/typing`, { isTyping })
      } catch (error) {
        console.error('Ошибка при отправке статуса печатания:', error)
      }
    }

    const toggleChatMenu = (chat) => {
      chat.showMenu = !chat.showMenu
    }

    const pinChat = async (chat) => {
      try {
        await api.post(`/chats/${chat.id}/pin`, { isPinned: !chat.isPinned })
        chat.isPinned = !chat.isPinned
        chat.showMenu = false
      } catch (error) {
        console.error('Ошибка при закреплении чата:', error)
      }
    }

    const markAsUnread = async (chat) => {
      try {
        await api.post(`/chats/${chat.id}/unread`)
        chat.unreadCount = 1
        chat.showMenu = false
      } catch (error) {
        console.error('Ошибка при отметке чата как непрочитанного:', error)
      }
    }

    const muteChat = async (chat) => {
      try {
        await api.post(`/chats/${chat.id}/mute`)
        chat.isMuted = !chat.isMuted
        chat.showMenu = false
      } catch (error) {
        console.error('Ошибка при отключении уведомлений:', error)
      }
    }

    const leaveGroup = async (chat) => {
      try {
        await api.post(`/chats/${chat.id}/leave`)
        chats.value = chats.value.filter(c => c.id !== chat.id)
        selectedChat.value = null
      } catch (error) {
        console.error('Ошибка при покидании группы:', error)
      }
    }

    onMounted(() => {
      loadChats()
    })

    return {
      activeTab,
      searchQuery,
      chats,
      selectedChat,
      newMessage,
      showCreateGroupModal,
      showAttachMenu,
      showEmojiPicker,
      messagesContainer,
      newGroup,
      userSearch,
      searchResults,
      filteredChats,
      currentUserId,
      selectChat,
      sendMessage,
      formatTime,
      searchUsers,
      addUser,
      removeUser,
      createGroup,
      replyingTo,
      showFormatting,
      emojiCategories,
      currentEmojiCategory,
      groupedMessages,
      canSendMessage,
      handleInput,
      formatText,
      replyToMessage,
      cancelReply,
      sendTypingStatus,
      toggleChatMenu,
      pinChat,
      markAsUnread,
      muteChat,
      leaveGroup
    }
  }
}
</script>

<style scoped>
.messenger {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

.messenger-sidebar {
  width: 350px;
  border-right: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-bar input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-bar input::placeholder {
  color: #a0aec0;
}

.chat-tabs {
  display: flex;
  padding: 8px;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #2196F3;
  color: #fff;
}

.tab-btn:hover:not(.active) {
  background: #f1f5f9;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-list::-webkit-scrollbar {
  width: 4px;
}

.chat-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.chat-item {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  position: relative;
}

.chat-item:hover {
  background: #f5f5f5;
}

.chat-item.active {
  background: #e3f2fd;
}

.chat-avatar {
  position: relative;
  width: 50px;
  height: 50px;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background: #4caf50;
}

.status-indicator.offline {
  background: #9e9e9e;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-item .chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.chat-item .chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.chat-item .chat-header .chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-item .chat-header .pin-indicator {
  font-size: 0.9rem;
}

.chat-item .chat-header .chat-time {
  font-size: 0.8rem;
  color: #666;
}

.chat-item .chat-preview {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item .chat-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.chat-item .unread-badge {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  background: #2196F3;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.chat-item .typing-indicator {
  font-size: 0.8rem;
  color: #2196F3;
  font-style: italic;
}

.chat-item .chat-actions-menu {
  position: relative;
}

.chat-item .chat-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 200px;
}

.chat-item .chat-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.chat-item .chat-menu button:hover {
  background: #f5f5f5;
}

.chat-item .chat-menu button.danger {
  color: #f44336;
}

.messenger-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.main-chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.main-chat-header .chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-chat-header img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.main-chat-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.main-chat-header .status {
  font-size: 0.9rem;
  color: #666;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.chat-actions button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.chat-actions button:hover {
  background: #f5f5f5;
  color: #2196F3;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1rem;
}

.message-own {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-text {
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-bottom-left-radius: 0;
  color: #2c3e50;
}

.message-own .message-text {
  background: #2196F3;
  color: white;
  border-radius: 1rem;
  border-bottom-right-radius: 0;
}

.message-image img {
  max-width: 100%;
  border-radius: 0.5rem;
  cursor: pointer;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}

.message-own .message-meta {
  flex-direction: row-reverse;
}

.message-status i {
  font-size: 0.9rem;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  border-radius: 1rem;
  padding: 0.5rem;
}

.input-wrapper textarea {
  width: 100%;
  border: none;
  background: none;
  resize: none;
  padding: 0.5rem 2.5rem 0.5rem 0.5rem;
  font-size: 0.95rem;
  max-height: 150px;
}

.attach-btn,
.emoji-btn,
.send-btn {
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.emoji-btn {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.5rem;
}

.send-btn {
  color: #2196F3;
}

.send-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.messenger-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.placeholder-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #2196F3;
}

.create-group {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.create-group-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #2196F3;
  color: #fff;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-group-btn:hover {
  background: #1e88e5;
}

.create-group-btn i {
  font-size: 16px;
}

.create-group-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #2d3748;
  background: #fff;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-group textarea {
  resize: none;
  height: 100px;
}

.participants-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-footer button {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-footer .cancel-btn {
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.modal-footer .cancel-btn:hover {
  background: #e2e8f0;
}

.modal-footer .create-btn {
  background: #2196F3;
  color: #fff;
  border: none;
}

.modal-footer .create-btn:hover {
  background: #1e88e5;
}

.date-separator {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.date-label {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.date-separator::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e0e0e0;
  z-index: 0;
}

.message-avatar {
  width: 32px;
  height: 32px;
  margin-right: 0.5rem;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble {
  position: relative;
}

.message-author {
  font-size: 0.85rem;
  color: #2196F3;
  margin-bottom: 0.25rem;
}

.message-reply-preview {
  background: rgba(0, 0, 0, 0.05);
  border-left: 3px solid #2196F3;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.reply-content {
  font-size: 0.9rem;
}

.reply-author {
  color: #2196F3;
  font-weight: 500;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2196F3;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.reaction-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reaction-badge:hover {
  background: rgba(0, 0, 0, 0.1);
}

.reply-bar {
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.reply-preview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.close-reply {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.format-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.format-toolbar button {
  padding: 0.25rem 0.5rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-toolbar button:hover {
  background: #f5f5f5;
  border-color: #2196F3;
  color: #2196F3;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.emoji-categories {
  display: flex;
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.emoji-categories button {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s ease;
}

.emoji-categories button:hover {
  background: #f5f5f5;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  padding: 0.5rem;
  overflow-y: auto;
}

.emoji-list button {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: transform 0.2s ease;
}

.emoji-list button:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .messenger {
    flex-direction: column;
  }

  .messenger-sidebar {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 60px;
    left: 0;
    z-index: 10;
    background: white;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .messenger-sidebar.active {
    transform: translateX(0);
  }

  .messenger-main {
    margin-left: 0;
  }

  .message-actions {
    opacity: 1;
  }
  
  .emoji-picker {
    width: 100%;
    left: 0;
  }
  
  .emoji-list {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Стили для модального окна создания группы */
.modal-overlay .create-group-modal {
  width: 560px !important;
  max-width: 560px !important;
  padding: 0 !important;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.create-group-modal .modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 20px 20px 0 0;
}

.create-group-modal .modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
}

.create-group-modal .create-group-form {
  padding: 24px;
}

.create-group-modal .form-group {
  margin-bottom: 20px;
}

.create-group-modal .form-group label {
  display: block;
  margin-bottom: 10px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.create-group-modal .input-wrapper {
  position: relative;
}

.create-group-modal .input-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
}

.create-group-modal .form-group input,
.create-group-modal .form-group textarea {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  color: #2d3748;
  background: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.create-group-modal .form-group input:focus,
.create-group-modal .form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.create-group-modal .form-group textarea {
  resize: none;
  height: 80px;
  padding-top: 16px;
}

.create-group-modal .selected-users-container {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  height: 120px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.create-group-modal .selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.create-group-modal .search-results {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  height: 160px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.create-group-modal .search-result {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #e2e8f0;
}

.create-group-modal .search-result:hover {
  background: #f8fafc;
}

.create-group-modal .search-result:last-child {
  border-bottom: none;
}

.create-group-modal .search-result img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.create-group-modal .user-info {
  flex: 1;
}

.create-group-modal .user-name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
  display: block;
}

.create-group-modal .user-role {
  font-size: 12px;
  color: #718096;
}

.create-group-modal .modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 20px 20px;
}

.create-group-modal .btn-secondary {
  padding: 10px 20px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.create-group-modal .btn-secondary:hover {
  background: #e2e8f0;
}

.create-group-modal .btn-primary,
.create-group-modal .create-btn {
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #2196F3 !important;
  color: white !important;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-group-modal .btn-primary:hover,
.create-group-modal .create-btn:hover {
  background-color: #1976D2 !important;
}

.create-group-modal .btn-primary:disabled,
.create-group-modal .create-btn:disabled {
  background-color: #2196F3 !important;
  opacity: 0.7;
  cursor: not-allowed;
}

/* Стили для скроллбара */
.create-group-modal .search-results::-webkit-scrollbar,
.create-group-modal .selected-users-container::-webkit-scrollbar {
  width: 4px;
}

.create-group-modal .search-results::-webkit-scrollbar-track,
.create-group-modal .selected-users-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.create-group-modal .search-results::-webkit-scrollbar-thumb,
.create-group-modal .selected-users-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.create-group-modal .search-results::-webkit-scrollbar-thumb:hover,
.create-group-modal .selected-users-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style> 