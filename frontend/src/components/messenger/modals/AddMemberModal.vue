<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="add-members-modal" @click.stop="">
      <div class="modal-header">
        <h3>Добавление участников</h3>
      </div>
      <div class="add-members-content">
        <div class="search-section">
          <div class="input-wrapper">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              :value="userSearch" 
              @input="$emit('search', $event.target.value)" 
              placeholder="Поиск пользователей..."
              class="search-input"
            >
          </div>
        </div>
        
        <div v-if="selectedUsers.length > 0" class="selected-users-section">
          <h4>Выбранные пользователи</h4>
          <div class="selected-users-list">
            <div 
              v-for="user in selectedUsers" 
              :key="user.id"
              class="selected-user-item"
            >
              <img :src="getUserAvatar(user)" :alt="getUserName(user)" class="user-avatar">
              <span class="user-name">{{ getUserName(user) }}</span>
              <button class="remove-user-btn" @click.stop="$emit('removeUser', user)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="search-results-section">
          <div v-if="searchResults.length > 0" class="search-results-list">
            <div 
              v-for="user in searchResults" 
              :key="user.id"
              class="search-result-item"
            >
              <img :src="getUserAvatar(user)" :alt="getUserName(user)" class="user-avatar">
              <div class="user-info">
                <span class="user-name">{{ getUserName(user) }}</span>
                <span v-if="user.email" class="user-email">{{ user.email }}</span>
              </div>
              <button class="add-user-btn" @click.stop="$emit('selectUser', user)">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <div v-else-if="userSearch && !searchResults.length" class="no-results">
            <i class="fas fa-search"></i>
            <p>Пользователи не найдены</p>
          </div>
          <div v-else-if="!userSearch" class="search-prompt">
            <i class="fas fa-user-plus"></i>
            <p>Начните вводить имя пользователя для поиска</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click.stop="$emit('close')">Отмена</button>
        <button 
          class="btn-primary" 
          @click.stop="$emit('add')"
          :disabled="!selectedUsers.length"
        >
          Добавить участников
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/ui/Modal.vue'
import { getUserAvatar, getUserName } from '@/utils/messageFormatters'

export default {
  name: 'AddMemberModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    userSearch: { type: String, default: '' },
    searchResults: { type: Array, default: () => [] },
    selectedUsers: { type: Array, default: () => [] }
  },
  emits: ['close', 'search', 'selectUser', 'removeUser', 'add'],
  setup() {
    return { getUserAvatar, getUserName }
  }
}
</script>

<style scoped>
.add-members-modal {
  width: 500px;
  max-width: 90vw;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.add-members-content {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.search-section {
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
}

.input-wrapper i {
  color: #94a3b8;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #334155;
}

.search-input:focus {
  outline: none;
}

.selected-users-section {
  margin-bottom: 20px;
}

.selected-users-section h4 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.selected-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  padding: 6px 10px;
  border-radius: 20px;
  border: 1px solid #bfdbfe;
}

.selected-user-item .user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.selected-user-item .user-name {
  font-size: 13px;
  color: #1e40af;
}

.remove-user-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #64748b;
  line-height: 1;
}

.remove-user-btn:hover {
  color: #ef4444;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.search-result-item:hover {
  background: #f8fafc;
}

.search-result-item .user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-info .user-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.user-email {
  font-size: 12px;
  color: #94a3b8;
}

.add-user-btn {
  background: #eff6ff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-user-btn:hover {
  background: #dbeafe;
}

.no-results,
.search-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #94a3b8;
}

.no-results i,
.search-prompt i {
  font-size: 36px;
  margin-bottom: 12px;
}

.no-results p,
.search-prompt p {
  margin: 0;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f1f5f9;
  border: none;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #2196F3;
  border: none;
  color: #fff;
}

.btn-primary:hover {
  background: #1976D2;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
