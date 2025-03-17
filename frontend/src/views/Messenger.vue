<template>
  <div class="messenger">
    <div class="messenger-container">
      <!-- Список чатов -->
      <div class="chats-list">
        <div class="chats-header">
          <h2>Сообщения</h2>
          <button class="btn btn-primary" @click="startNewChat">
            Новый чат
          </button>
        </div>

        <div class="chats-search">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск чатов..."
            class="search-input"
          />
        </div>

        <div class="chats">
          <div
            v-for="chat in filteredChats"
            :key="chat.id"
            class="chat-item"
            :class="{ active: currentChat?.id === chat.id }"
            @click="selectChat(chat)"
          >
            <div class="chat-avatar">
              {{ chat.name[0] }}
            </div>
            <div class="chat-info">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="chat-preview">{{ chat.lastMessage }}</div>
            </div>
            <div class="chat-meta">
              <div class="chat-time">{{ formatTime(chat.lastMessageTime) }}</div>
              <div v-if="chat.unreadCount" class="unread-badge">
                {{ chat.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Область чата -->
      <div class="chat-area" v-if="currentChat">
        <div class="chat-header">
          <div class="chat-user-info">
            <div class="chat-avatar">{{ currentChat.name[0] }}</div>
            <div class="chat-name">{{ currentChat.name }}</div>
          </div>
          <div class="chat-actions">
            <button class="btn btn-icon" @click="toggleChatInfo">
              <i class="fas fa-info-circle"></i>
            </button>
            <button class="btn btn-icon" @click="toggleChatSettings">
              <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="message in currentChat.messages"
            :key="message.id"
            class="message"
            :class="{ 'message-out': message.isOutgoing }"
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
            placeholder="Введите сообщение..."
            @keyup.enter.exact="sendMessage"
            @keyup.enter.shift.exact="newLine"
            rows="1"
            ref="messageInput"
          ></textarea>
          <button
            class="btn btn-primary"
            @click="sendMessage"
            :disabled="!newMessage.trim()"
          >
            Отправить
          </button>
        </div>
      </div>

      <!-- Информация о чате -->
      <div class="chat-info-panel" v-if="showChatInfo">
        <div class="info-header">
          <h3>Информация о чате</h3>
          <button class="btn btn-icon" @click="showChatInfo = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="info-content">
          <div class="info-section">
            <h4>Участники</h4>
            <div class="participants-list">
              <div
                v-for="participant in currentChat.participants"
                :key="participant.id"
                class="participant"
              >
                <div class="participant-avatar">
                  {{ participant.name[0] }}
                </div>
                <div class="participant-info">
                  <div class="participant-name">{{ participant.name }}</div>
                  <div class="participant-role">{{ participant.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'Messenger',
  data() {
    return {
      chats: [],
      currentChat: null,
      searchQuery: '',
      newMessage: '',
      showChatInfo: false,
      showChatSettings: false
    }
  },
  computed: {
    filteredChats() {
      if (!this.searchQuery) return this.chats;
      const query = this.searchQuery.toLowerCase();
      return this.chats.filter(chat =>
        chat.name.toLowerCase().includes(query)
      );
    }
  },
  async created() {
    await this.loadChats();
    // Здесь можно добавить подключение к WebSocket для получения сообщений в реальном времени
  },
  methods: {
    async loadChats() {
      try {
        const response = await api.get('/chats');
        this.chats = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке чатов:', error);
      }
    },
    selectChat(chat) {
      this.currentChat = chat;
      this.loadMessages(chat.id);
    },
    async loadMessages(chatId) {
      try {
        const response = await api.get(`/chats/${chatId}/messages`);
        this.currentChat.messages = response.data;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error);
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return;

      try {
        const response = await api.post(`/chats/${this.currentChat.id}/messages`, {
          text: this.newMessage
        });
        this.currentChat.messages.push(response.data);
        this.newMessage = '';
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    },
    newLine(e) {
      e.preventDefault();
      this.newMessage += '\n';
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
    formatTime(time) {
      return new Date(time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    startNewChat() {
      // Здесь можно добавить логику создания нового чата
    },
    toggleChatInfo() {
      this.showChatInfo = !this.showChatInfo;
    },
    toggleChatSettings() {
      this.showChatSettings = !this.showChatSettings;
    }
  }
}
</script>

<style scoped>
.messenger {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.messenger-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100%;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
}

.chats-list {
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.chats-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chats-search {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.chats {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #eee;
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
  background-color: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.chat-preview {
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-time {
  font-size: 0.8rem;
  color: #666;
}

.unread-badge {
  background-color: #28a745;
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  margin-top: 0.25rem;
}

.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.messages-container {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 70%;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  background-color: #f8f9fa;
  align-self: flex-start;
}

.message-out {
  background-color: #28a745;
  color: white;
  align-self: flex-end;
}

.message-content {
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.7;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
}

.message-input textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  resize: none;
  font-family: inherit;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-icon {
  background: none;
  border: none;
  color: #666;
  padding: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-info-panel {
  width: 300px;
  border-left: 1px solid #eee;
  background-color: white;
}

.info-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-content {
  padding: 1rem;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.participant {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-weight: 500;
}

.participant-role {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .messenger-container {
    grid-template-columns: 1fr;
  }

  .chats-list {
    display: none;
  }

  .chats-list.active {
    display: flex;
  }

  .chat-info-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
  }
}
</style> 