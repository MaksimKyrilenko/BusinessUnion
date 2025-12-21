<template>
  <Modal :show="show" @close="$emit('close')" class="chat-info-modal">
    <div class="chat-info-container" v-if="chat">
      <!-- Header с аватаром и информацией -->
      <div class="info-header">
        <div class="header-bg"></div>
        <div class="header-content">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img :src="groupAvatar" alt="Аватар группы">
              <button v-if="isAdmin" class="avatar-edit-btn" @click="$emit('changeAvatar')">
                <i class="fas fa-camera"></i>
              </button>
            </div>
          </div>
          <div class="info-section">
            <h2 class="chat-name">{{ chat.name || 'Группа' }}</h2>
            <p class="chat-meta">
              <i class="fas fa-users"></i>
              {{ members.length }} участников
            </p>
            <p v-if="chat.description" class="chat-description">{{ chat.description }}</p>
            <p v-else class="chat-description empty">Нет описания</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="info-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="$emit('update:activeTab', tab.id)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Members Tab -->
        <div v-if="activeTab === 'members'" class="members-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              :value="memberSearch" 
              @input="$emit('update:memberSearch', $event.target.value)"
              placeholder="Поиск участников..."
            >
          </div>
          
          <div v-if="filteredMembers.length > 0" class="members-list">
            <div v-for="member in filteredMembers" :key="member.id" class="member-card">
              <div class="member-avatar">
                <img :src="getUserAvatar(member)" :alt="getUserFullName(member)">
                <span class="status-dot" :class="{ online: member.isOnline }"></span>
              </div>
              <div class="member-details">
                <span class="member-name">{{ getUserFullName(member) }}</span>
                <span class="member-role" :class="member.role">{{ getMemberRoleText(member.role) }}</span>
              </div>
              <button 
                v-if="isAdmin && member.role !== 'owner'" 
                class="member-remove-btn"
                @click="$emit('removeMember', member)"
                title="Удалить участника"
              >
                <i class="fas fa-user-minus"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-user-slash"></i>
            <p>Участники не найдены</p>
          </div>
        </div>

        <!-- Media Tab -->
        <div v-else-if="activeTab === 'media'" class="media-section">
          <div v-if="mediaMessages.length > 0" class="media-grid">
            <div 
              v-for="msg in mediaMessages" 
              :key="msg.id" 
              class="media-item"
              @click="$emit('previewImage', msg)"
            >
              <img :src="msg.fileUrl || msg.url" :alt="msg.fileName || 'Изображение'">
              <div class="media-overlay">
                <span class="media-date">{{ formatDate(msg.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-images"></i>
            <p>Нет изображений</p>
          </div>
        </div>

        <!-- Files Tab -->
        <div v-else-if="activeTab === 'files'" class="files-section">
          <div v-if="fileMessages.length > 0" class="files-list">
            <div v-for="msg in fileMessages" :key="msg.id" class="file-card">
              <div class="file-icon">
                <i :class="['fas', getFileIcon(msg.fileName)]"></i>
              </div>
              <div class="file-info">
                <span class="file-name">{{ msg.fileName || 'Файл' }}</span>
                <span class="file-meta">
                  {{ formatFileSize(msg.fileSize || msg.size || 0) }} • {{ formatDate(msg.createdAt) }}
                </span>
              </div>
              <button class="file-download-btn" @click="downloadFile(msg)">
                <i class="fas fa-download"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>Нет файлов</p>
          </div>
        </div>

        <!-- Links Tab -->
        <div v-else-if="activeTab === 'links'" class="links-section">
          <div v-if="linkMessages.length > 0" class="links-list">
            <a 
              v-for="(link, index) in linkMessages" 
              :key="index" 
              :href="link.url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="link-card"
            >
              <div class="link-icon">
                <i class="fas fa-link"></i>
              </div>
              <div class="link-info">
                <span class="link-url">{{ link.url }}</span>
                <span class="link-meta">{{ formatDate(link.date) }} • {{ link.sender }}</span>
              </div>
              <i class="fas fa-external-link-alt link-external"></i>
            </a>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-unlink"></i>
            <p>Нет ссылок</p>
          </div>
        </div>

        <!-- Settings Tab (Admin only) -->
        <div v-else-if="activeTab === 'settings'" class="settings-section">
          <div class="setting-item">
            <div class="setting-left">
              <i class="fas fa-bell"></i>
              <div class="setting-text">
                <span class="setting-title">Уведомления</span>
                <span class="setting-desc">Получать уведомления о новых сообщениях</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" :checked="notifications" @change="$emit('update:notifications', $event.target.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item danger">
            <div class="setting-left">
              <i class="fas fa-trash-alt"></i>
              <div class="setting-text">
                <span class="setting-title">Удалить группу</span>
                <span class="setting-desc">Группа будет удалена для всех участников</span>
              </div>
            </div>
            <button class="danger-btn" @click="$emit('deleteGroup')">
              Удалить
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="action-btn primary" @click="$emit('addMembers')">
          <i class="fas fa-user-plus"></i>
          Добавить
        </button>
        <button class="action-btn secondary" @click="$emit('editGroup')">
          <i class="fas fa-edit"></i>
          Изменить
        </button>
        <button class="action-btn danger" @click="$emit('leaveGroup')">
          <i class="fas fa-sign-out-alt"></i>
          Выйти
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { getUserAvatar, getUserFullName, getMemberRoleText, formatFileSize, getFileIcon } from '@/utils/messageFormatters'

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
    'removeMember',
    'previewImage'
  ],
  setup(props) {
    // Дефолтный аватар для группы (генерируем на основе первой буквы названия)
    const groupAvatar = computed(() => {
      if (props.chat?.avatar) return props.chat.avatar
      // Возвращаем data URL с SVG иконкой группы
      const name = props.chat?.name || 'Г'
      const letter = name.charAt(0).toUpperCase()
      return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%232196F3" width="100" height="100" rx="50"/><text x="50" y="50" font-family="Arial,sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`)}`
    })

    // Получаем медиа сообщения (изображения)
    const mediaMessages = computed(() => {
      if (!props.chat?.messages) return []
      return props.chat.messages.filter(msg => msg.type === 'image')
    })

    // Получаем файловые сообщения
    const fileMessages = computed(() => {
      if (!props.chat?.messages) return []
      return props.chat.messages.filter(msg => msg.type === 'file')
    })

    // Извлекаем ссылки из текстовых сообщений
    const linkMessages = computed(() => {
      if (!props.chat?.messages) return []
      const urlRegex = /(https?:\/\/[^\s<]+)/g
      const links = []
      
      props.chat.messages.forEach(msg => {
        if (msg.type === 'text' || !msg.type) {
          const matches = msg.text?.match(urlRegex)
          if (matches) {
            matches.forEach(url => {
              links.push({
                url,
                date: msg.createdAt,
                sender: getUserFullName(msg.sender)
              })
            })
          }
        }
      })
      
      return links
    })

    // Tabs configuration
    const tabs = computed(() => [
      { id: 'members', label: 'Участники', icon: 'fas fa-users', count: props.members.length },
      { id: 'media', label: 'Медиа', icon: 'fas fa-images', count: mediaMessages.value.length },
      { id: 'files', label: 'Файлы', icon: 'fas fa-file-alt', count: fileMessages.value.length },
      { id: 'links', label: 'Ссылки', icon: 'fas fa-link', count: linkMessages.value.length },
      ...(props.isAdmin ? [{ id: 'settings', label: 'Настройки', icon: 'fas fa-cog', count: 0 }] : [])
    ])

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    }

    const downloadFile = (msg) => {
      const fileUrl = msg.fileUrl || msg.url
      if (!fileUrl) return
      
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = msg.fileName || 'file'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      getUserAvatar,
      getUserFullName,
      getMemberRoleText,
      formatFileSize,
      getFileIcon,
      formatDate,
      downloadFile,
      mediaMessages,
      fileMessages,
      linkMessages,
      tabs,
      groupAvatar
    }
  }
}
</script>


<style scoped>
.chat-info-container {
  width: 480px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

/* Header */
.info-header {
  position: relative;
  padding-bottom: 20px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.header-content {
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  margin-top: 30px;
}

.avatar-wrapper img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: #2196F3;
  border: 3px solid #fff;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.avatar-edit-btn:hover {
  background: #1976D2;
}

.info-section {
  margin-top: 12px;
}

.chat-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.chat-meta {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.chat-description {
  margin: 10px 0 0;
  font-size: 14px;
  color: #475569;
  max-width: 350px;
}

.chat-description.empty {
  color: #94a3b8;
  font-style: italic;
}

/* Tabs */
.info-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 12px;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 70px;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.tab-btn i {
  font-size: 16px;
}

.tab-btn:hover {
  color: #2196F3;
}

.tab-btn.active {
  color: #2196F3;
  border-bottom-color: #2196F3;
}

.tab-count {
  background: #e2e8f0;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.tab-btn.active .tab-count {
  background: #dbeafe;
  color: #2196F3;
}

/* Tab Content */
.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  min-height: 200px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

/* Members Section */
.members-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Search Box */
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
}

.search-box i {
  color: #94a3b8;
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #334155;
  outline: none;
}

/* Members List */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.members-list::-webkit-scrollbar {
  width: 6px;
}

.members-list::-webkit-scrollbar-track {
  background: transparent;
}

.members-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.members-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s;
}

.member-card:hover {
  background: #f8fafc;
}

.member-avatar {
  position: relative;
  flex-shrink: 0;
}

.member-avatar img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.status-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid #fff;
}

.status-dot.online {
  background: #22c55e;
}

.member-details {
  flex: 1;
  min-width: 0;
}

.member-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.member-role {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.member-role.owner {
  color: #f59e0b;
}

.member-role.admin {
  color: #2196F3;
}

.member-remove-btn {
  background: none;
  border: none;
  padding: 8px;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.member-remove-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.media-grid::-webkit-scrollbar {
  width: 6px;
}

.media-grid::-webkit-scrollbar-track {
  background: transparent;
}

.media-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.media-item:hover img {
  transform: scale(1.05);
}

.media-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transition: opacity 0.2s;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-date {
  font-size: 11px;
  color: #fff;
}

/* Files List */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.files-list::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-track {
  background: transparent;
}

.files-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  transition: background 0.2s;
}

.file-card:hover {
  background: #f1f5f9;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: #dbeafe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196F3;
  font-size: 18px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.file-download-btn {
  background: #2196F3;
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.file-download-btn:hover {
  background: #1976D2;
}

/* Links List */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.links-list::-webkit-scrollbar {
  width: 6px;
}

.links-list::-webkit-scrollbar-track {
  background: transparent;
}

.links-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s;
}

.link-card:hover {
  background: #f1f5f9;
}

.link-icon {
  width: 40px;
  height: 40px;
  background: #dbeafe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196F3;
  font-size: 16px;
  flex-shrink: 0;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-url {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #2196F3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-meta {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.link-external {
  color: #94a3b8;
  font-size: 12px;
}

/* Settings */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
}

.setting-item.danger {
  background: #fef2f2;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-left i {
  font-size: 18px;
  color: #64748b;
  width: 24px;
  text-align: center;
}

.setting-item.danger .setting-left i {
  color: #ef4444;
}

.setting-text {
  display: flex;
  flex-direction: column;
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

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-slider:before {
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

input:checked + .toggle-slider {
  background: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.danger-btn {
  background: #ef4444;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.danger-btn:hover {
  background: #dc2626;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
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
  transition: all 0.2s;
}

.action-btn.primary {
  background: #2196F3;
  color: #fff;
}

.action-btn.primary:hover {
  background: #1976D2;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.action-btn.danger {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.danger:hover {
  background: #fee2e2;
}
</style>

<!-- Глобальные стили для переопределения Modal - убираем внешний скролл -->
<style>
.chat-info-modal .modal-body {
  overflow: hidden !important;
  padding: 0 !important;
}
</style>