<template>
  <div class="messenger-sidebar">
    <div class="search-bar">
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="Поиск чатов..."
      >
    </div>

    <div class="chat-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'personal' }]"
        @click="$emit('update:activeTab', 'personal')"
      >
        Личные
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'group' }]"
        @click="$emit('update:activeTab', 'group')"
      >
        Групповые
      </button>
    </div>

    <div class="chat-list">
      <div v-if="loading" class="chat-loading-indicator">
        <span>Загрузка чатов...</span>
      </div>
      <div v-else-if="filteredChats.length === 0" class="empty-chat-list">
        <div class="empty-state">
          <i class="fas fa-comments"></i>
          <p v-if="chats.length === 0">У вас пока нет чатов</p>
          <p v-else>Нет чатов в выбранной категории</p>
          <button v-if="activeTab === 'group'" class="create-group-btn" @click="$emit('createGroup')">
            Создать группу
          </button>
        </div>
      </div>
      <template v-else>
        <ChatItem
          v-for="chat in filteredChats"
          :key="chat.id"
          :chat="chat"
          :selected="selectedChat?.id === chat.id"
          :currentUserId="currentUserId"
          :onlineUsers="onlineUsers"
          @select="$emit('selectChat', chat.id)"
          @toggleMenu="$emit('toggleChatMenu', chat)"
          @pin="$emit('pinChat', chat)"
          @markUnread="$emit('markAsUnread', chat)"
          @mute="$emit('muteChat', chat)"
          @leave="$emit('leaveGroup', chat)"
        />
      </template>
    </div>

    <div class="create-group" v-if="activeTab === 'group'">
      <button class="create-group-btn" @click="$emit('createGroup')">
        <i class="fas fa-plus"></i> Создать группу
      </button>
    </div>
  </div>
</template>

<script>
import ChatItem from './ChatItem.vue'

export default {
  name: 'ChatSidebar',
  components: { ChatItem },
  props: {
    chats: { type: Array, default: () => [] },
    filteredChats: { type: Array, default: () => [] },
    selectedChat: { type: Object, default: null },
    activeTab: { type: String, default: 'personal' },
    searchQuery: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    currentUserId: { type: [String, Number], default: null },
    onlineUsers: { type: Array, default: () => [] }
  },
  emits: [
    'update:activeTab',
    'update:searchQuery',
    'selectChat',
    'createGroup',
    'toggleChatMenu',
    'pinChat',
    'markAsUnread',
    'muteChat',
    'leaveGroup'
  ]
}
</script>

<style scoped>
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
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-loading-indicator,
.empty-chat-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
}

.empty-state {
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 16px;
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
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.create-group-btn:hover {
  background: #1976D2;
}
</style>
