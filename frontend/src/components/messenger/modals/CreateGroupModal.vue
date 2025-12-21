<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="create-group-modal">
      <div class="modal-header">
        <h3>Создание группы</h3>
      </div>
      <form @submit.prevent="$emit('create')" class="create-group-form">
        <div class="form-group">
          <label>Название группы</label>
          <div class="input-wrapper no-border">
            <i class="fas fa-users"></i>
            <input 
              :value="group.name" 
              @input="$emit('update:name', $event.target.value)"
              type="text" 
              placeholder="Введите название группы"
              required
              class="no-border"
            >
          </div>
        </div>
        <div class="form-group">
          <label>Описание</label>
          <div class="input-wrapper no-border">
            <i class="fas fa-info-circle"></i>
            <textarea 
              :value="group.description"
              @input="$emit('update:description', $event.target.value)"
              placeholder="Добавьте описание группы"
              rows="3"
              class="no-border"
            ></textarea>
          </div>
        </div>
        <div class="form-group">
          <label>Участники</label>
          <div class="selected-users-container">
            <div class="selected-users" v-if="group.users.length">
              <div v-for="user in group.users" :key="user.id" class="selected-user">
                <img :src="getUserAvatar(user)" :alt="getUserName(user)">
                <span>{{ getUserName(user) }}</span>
                <button @click="$emit('removeUser', user, $event)" class="remove-user">
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
            <div class="input-wrapper no-border">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                :value="userSearch" 
                @input="$emit('searchUsers', $event.target.value)" 
                placeholder="Поиск пользователей..."
                class="no-border"
              >
            </div>
            <div v-if="searchResults.length" class="search-results">
              <div 
                v-for="user in searchResults" 
                :key="user.id"
                class="search-result"
                @click="$emit('addUser', user, $event)"
              >
                <img :src="getUserAvatar(user)" :alt="getUserName(user)">
                <div class="user-info">
                  <span class="user-name">{{ getUserName(user) }}</span>
                  <span class="user-role">{{ user.role || '' }}</span>
                </div>
                <button class="add-user">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div v-else-if="userSearch && !searchResults.length" class="no-results">
              <i class="fas fa-search"></i>
              <span>Пользователи не найдены</span>
            </div>
          </div>
        </div>
      </form>
      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">
          <i class="fas fa-times"></i>
          Отмена
        </button>
        <button 
          class="btn-primary create-btn" 
          @click="$emit('create')"
          :disabled="!group.name"
        >
          <i class="fas fa-check"></i>
          Создать
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/ui/Modal.vue'
import { getUserAvatar, getUserName } from '@/utils/messageFormatters'

export default {
  name: 'CreateGroupModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    group: { type: Object, default: () => ({ name: '', description: '', users: [] }) },
    userSearch: { type: String, default: '' },
    searchResults: { type: Array, default: () => [] }
  },
  emits: ['close', 'create', 'update:name', 'update:description', 'addUser', 'removeUser', 'searchUsers'],
  setup() {
    return { getUserAvatar, getUserName }
  }
}
</script>

<style scoped>
.create-group-modal {
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

.create-group-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
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

.input-wrapper.no-border {
  border: none;
}

.input-wrapper i {
  color: #94a3b8;
}

.input-wrapper input,
.input-wrapper textarea {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #334155;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  outline: none;
}

.input-wrapper input::placeholder,
.input-wrapper textarea::placeholder {
  color: #94a3b8;
}

.selected-users-container {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-user {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 6px 10px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.selected-user img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.selected-user span {
  font-size: 13px;
  color: #334155;
}

.remove-user {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
}

.remove-user:hover {
  color: #ef4444;
}

.no-users-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
  padding: 12px;
}

.search-users-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-result:hover {
  background: #f8fafc;
}

.search-result img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.user-role {
  font-size: 12px;
  color: #94a3b8;
}

.add-user {
  background: #eff6ff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  color: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #94a3b8;
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
  display: flex;
  align-items: center;
  gap: 8px;
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
