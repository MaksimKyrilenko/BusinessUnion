<template>
  <Modal :show="show" @close="$emit('close')" class="group-info-fullscreen-modal">
    <div class="group-info-modal" v-if="chat">
      <div class="group-info-content">
        <div class="group-header">
          <div class="group-avatar">
            <img :src="chat.avatar || '/assets/images/default-avatar.svg'" alt="Аватар группы">
            <div class="edit-avatar" v-if="isAdmin" @click="$emit('changeAvatar')">
              <i class="fas fa-camera"></i>
            </div>
          </div>
          <div class="group-details">
            <div class="group-name-section">
              <h2>{{ chat.name || 'Название группы' }}</h2>
            </div>
            <div class="group-created">
              <i class="fas fa-calendar-alt"></i> 
              Создан: {{ chat.createdAt ? formatDate(chat.createdAt) : 'Нет данных' }}
            </div>
            <div class="description-section">
              <h4>Описание</h4>
              <p class="group-description">{{ chat.description || 'Нет описания' }}</p>
            </div>
            <div class="group-stats">
              <div class="stat-item">
                <i class="fas fa-users"></i>
                <span>{{ members.length }} участников</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-comment-alt"></i>
                <span>{{ chat.messages?.length || 0 }} сообщений</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="group-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'members' }]"
            @click="$emit('update:activeTab', 'members')"
          >
            <i class="fas fa-users"></i> Участники
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'media' }]"
            @click="$emit('update:activeTab', 'media')"
          >
            <i class="fas fa-photo-video"></i> Медиа
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'files' }]"
            @click="$emit('update:activeTab', 'files')"
          >
            <i class="fas fa-file"></i> Файлы
          </button>
          <button 
            v-if="isAdmin"
            :class="['tab-btn', { active: activeTab === 'settings' }]"
            @click="$emit('update:activeTab', 'settings')"
          >
            <i class="fas fa-cog"></i> Настройки
          </button>
        </div>
        
        <div class="tab-content">
          <!-- Members tab -->
          <div v-if="activeTab === 'members'" class="members-tab">
            <div class="members-search">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                :value="memberSearch" 
                @input="$emit('update:memberSearch', $event.target.value)"
                placeholder="Поиск по участникам..."
              >
            </div>
            
            <div v-if="filteredMembers.length > 0" class="members-list">
              <div v-for="member in filteredMembers" :key="member.id" class="member-item">
                <div class="member-avatar">
                  <img :src="getUserAvatar(member)" :alt="getUserFullName(member)">
                  <span class="online-status" :class="{ online: member.isOnline }"></span>
                </div>
                <div class="member-info">
                  <div class="member-name">{{ getUserFullName(member) }}</div>
                  <div class="member-role">{{ getMemberRoleText(member.role) }}</div>
                </div>
                <div class="member-actions" v-if="isAdmin && member.role !== 'owner'">
                  <button class="member-action-btn" @click="$emit('removeMember', member)">
                    <i class="fas fa-user-times"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-users"></i>
              <p>Участники не найдены</p>
            </div>
          </div>
          
          <!-- Media tab -->
          <div v-else-if="activeTab === 'media'" class="media-tab">
            <div class="empty-state">
              <i class="fas fa-photo-video"></i>
              <p>Нет медиафайлов</p>
            </div>
          </div>
          
          <!-- Files tab -->
          <div v-else-if="activeTab === 'files'" class="files-tab">
            <div class="empty-state">
              <i class="fas fa-file"></i>
              <p>Нет файлов</p>
            </div>
          </div>
          
          <!-- Settings tab -->
          <div v-else-if="activeTab === 'settings'" class="settings-tab">
            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <i class="fas fa-bell"></i>
                  <div class="setting-text">
                    <div class="setting-title">Уведомления</div>
                    <div class="setting-desc">Получать уведомления о новых сообщениях</div>
                  </div>
                </div>
                <div class="setting-control">
                  <label class="switch">
                    <input type="checkbox" :checked="notifications" @change="$emit('update:notifications', $event.target.checked)">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="setting-item danger">
                <div class="setting-info">
                  <i class="fas fa-trash"></i>
                  <div class="setting-text">
                    <div class="setting-title">Удалить группу</div>
                    <div class="setting-desc">Удалить группу для всех участников</div>
                  </div>
                </div>
                <div class="setting-control">
                  <button class="btn-danger" @click="$emit('deleteGroup')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="group-action-buttons">
        <button class="action-button edit-button" @click="$emit('editGroup')">
          <i class="fas fa-edit"></i> ИЗМЕНИТЬ
        </button>
        <button class="action-button add-button" @click="$emit('addMembers')">
          <i class="fas fa-user-plus"></i> ДОБАВИТЬ
        </button>
        <button class="action-button leave-button" @click="$emit('leaveGroup')">
          <i class="fas fa-sign-out-alt"></i> ВЫЙТИ
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/ui/Modal.vue'
import { getUserAvatar, getUserFullName, getMemberRoleText, formatDate } from '@/utils/messageFormatters'

export default {
  name: 'GroupInfoModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    chat: { type: Object, default: null },
    members: { type: Array, default: () => [] },
    filteredMembers: { type: Array, default: () => [] },
    activeTab: { type: String, default: 'members' },
    memberSearch: { type: String, default: '' },
    notifications: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false }
  },
  emits: [
    'close',
    'update:activeTab',
    'update:memberSearch',
    'update:notifications',
    'editGroup',
    'addMembers',
    'leaveGroup',
    'deleteGroup',
    'changeAvatar',
    'removeMember'
  ],
  setup() {
    return { getUserAvatar, getUserFullName, getMemberRoleText, formatDate }
  }
}
</script>

<style scoped>
.group-info-modal {
  width: 600px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.group-info-content {
  flex: 1;
  overflow-y: auto;
}

.group-header {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.group-avatar {
  position: relative;
  flex-shrink: 0;
}

.group-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.edit-avatar:hover {
  background: rgba(0, 0, 0, 0.7);
}

.group-details {
  flex: 1;
}

.group-name-section h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.group-created {
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 12px;
}

.description-section h4 {
  margin: 0 0 4px;
  font-size: 12px;
  text-transform: uppercase;
  opacity: 0.7;
}

.group-description {
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.9;
}

.group-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.group-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.group-tabs .tab-btn {
  flex: 1;
  padding: 14px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.group-tabs .tab-btn:hover {
  color: #2196F3;
}

.group-tabs .tab-btn.active {
  color: #2196F3;
  border-bottom-color: #2196F3;
}

.tab-content {
  padding: 16px;
  min-height: 200px;
}

.members-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.members-search i {
  color: #94a3b8;
}

.members-search input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #334155;
}

.members-search input:focus {
  outline: none;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.member-item:hover {
  background: #f8fafc;
}

.member-avatar {
  position: relative;
}

.member-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid #fff;
}

.online-status.online {
  background: #22c55e;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.member-role {
  font-size: 12px;
  color: #64748b;
}

.member-action-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.member-action-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #94a3b8;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.setting-item.danger {
  background: #fef2f2;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-info i {
  font-size: 20px;
  color: #64748b;
}

.setting-item.danger .setting-info i {
  color: #ef4444;
}

.setting-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.setting-desc {
  font-size: 12px;
  color: #64748b;
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  border-radius: 24px;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.btn-danger {
  background: #ef4444;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-danger:hover {
  background: #dc2626;
}

.group-action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button {
  background: #2196F3;
  color: #fff;
}

.edit-button:hover {
  background: #1976D2;
}

.add-button {
  background: #22c55e;
  color: #fff;
}

.add-button:hover {
  background: #16a34a;
}

.leave-button {
  background: #ef4444;
  color: #fff;
}

.leave-button:hover {
  background: #dc2626;
}
</style>
