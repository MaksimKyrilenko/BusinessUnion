<template>
  <div class="messages">
    <div class="messages-sidebar">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Поиск чатов..."
          @input="searchChats"
        >
      </div>
      
      <div class="chat-list">
        <div 
          v-for="chat in filteredChats" 
          :key="chat.id"
          :class="['chat-item', { active: currentChat?.id === chat.id }]"
          @click="selectChat(chat)"
        >
          <img :src="chat.avatar || '/default-avatar.png'" alt="Avatar" class="chat-avatar">
          <div class="chat-info">
            <div class="chat-name">{{ chat.name }}</div>
            <div class="chat-preview">{{ chat.lastMessage }}</div>
          </div>
          <div class="chat-meta">
            <div class="chat-time">{{ formatTime(chat.lastMessageTime) }}</div>
            <div v-if="chat.unreadCount" class="unread-count">
              {{ chat.unreadCount }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="messages-main">
      <template v-if="currentChat">
        <div class="chat-header">
          <img :src="currentChat.avatar || '/default-avatar.png'" alt="Avatar" class="chat-avatar">
          <div class="chat-info">
            <div class="chat-name">{{ currentChat.name }}</div>
            <div class="chat-status">{{ currentChat.status }}</div>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in currentChat.messages" 
            :key="message.id"
            :class="['message', { 'message-own': message.isOwn }]"
          >
            <div class="message-content">
              {{ message.text }}
            </div>
            <div class="message-time">
              {{ formatTime(message.time) }}
            </div>
          </div>
        </div>

        <div class="message-input">
          <textarea 
            v-model="newMessage" 
            @keyup.enter="sendMessage"
            placeholder="Введите сообщение..."
            rows="1"
          ></textarea>
          <BaseButton @click="sendMessage">Отправить</BaseButton>
        </div>
      </template>

      <div v-else class="no-chat-selected">
        <p>Выберите чат для начала общения</p>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'Messages',
  components: {
    BaseButton
  },
  data() {
    return {
      chats: [],
      currentChat: null,
      newMessage: '',
      searchQuery: ''
    }
  },
  computed: {
    filteredChats() {
      if (!this.searchQuery) return this.chats
      const query = this.searchQuery.toLowerCase()
      return this.chats.filter(chat => 
        chat.name.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    async loadChats() {
      try {
        const response = await api.get('/messages/chats')
        this.chats = response.data
      } catch (error) {
        console.error('Ошибка при загрузке чатов:', error)
      }
    },
    async selectChat(chat) {
      this.currentChat = chat
      try {
        const response = await api.get(`/messages/chat/${chat.id}`)
        this.currentChat.messages = response.data
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error)
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.currentChat) return

      try {
        await api.post(`/messages/chat/${this.currentChat.id}`, {
          text: this.newMessage
        })
        this.newMessage = ''
        await this.selectChat(this.currentChat)
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
      }
    },
    formatTime(time) {
      return format(new Date(time), 'HH:mm', { locale: ru })
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    searchChats() {
      // Реализация поиска уже в computed
    }
  },
  created() {
    this.loadChats()
  }
}
</script>

<style scoped>
.messages {
  display: flex;
  height: calc(100vh - 150px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.messages-sidebar {
  width: 300px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f8f9fa;
}

.chat-item.active {
  background-color: #e8f5e9;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.chat-preview {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.messages-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin-bottom: 10px;
  max-width: 70%;
}

.message-own {
  margin-left: auto;
}

.message-content {
  background: #f1f0f0;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 5px;
}

.message-own .message-content {
  background: #e8f5e9;
}

.message-time {
  font-size: 0.8em;
  color: #666;
  text-align: right;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.message-input textarea {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.unread-count {
  background: #28a745;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
}
</style> 