<template>
  <Modal :show="show" @close="$emit('close')" class="chat-info-modal">
    <div class="chat-info-container" v-if="chat && otherUser">
      <!-- Header с аватаром и информацией -->
      <div class="info-header">
        <div class="header-bg"></div>
        <div class="header-content">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img :src="getUserAvatar(otherUser)" :alt="getUserFullName(otherUser)">
              <span class="status-indicator" :class="{ online: isOnline }"></span>
            </div>
          </div>
          <div class="info-section">
            <h2 class="user-name">{{ getUserFullName(otherUser) }}</h2>
            <p class="user-status" :class="{ online: isOnline }">
              {{ isOnline ? 'В сети' : 'Не в сети' }}
            </p>
            <p v-if="otherUser.email" class="user-email">
              <i class="fas fa-envelope"></i>
              {{ otherUser.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="info-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Media Tab -->
        <div v-if="activeTab === 'media'" class="media-section">
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

        <!-- Settings Tab -->
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
          
          <div class="setting-item">
            <div class="setting-left">
              <i class="fas fa-ban"></i>
              <div class="setting-text">
                <span class="setting-title">Заблокировать</span>
                <span class="setting-desc">Пользователь не сможет отправлять вам сообщения</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" :checked="isBlocked" @change="$emit('toggleBlock')">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item danger">
            <div class="setting-left">
              <i class="fas fa-trash-alt"></i>
              <div class="setting-text">
                <span class="setting-title">Удалить чат</span>
                <span class="setting-desc">История сообщений будет удалена</span>
              </div>
            </div>
            <button class="danger-btn" @click="$emit('deleteChat')">
              Удалить
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="action-btn secondary" @click="$emit('close')">
          <i class="fas fa-times"></i>
          Закрыть
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { ref, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { getUserAvatar, getUserFullName, formatFileSize, getFileIcon } from '@/utils/messageFormatters'

export default {
  name: 'PersonalChatInfoModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    chat: { type: Object, default: null },
    currentUserId: { type: [String, Number], default: null },
    onlineUsers: { type: Array, default: () => [] },
    notifications: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false }
  },
  emits: [
    'close',
    'update:notifications',
    'toggleBlock',
    'deleteChat',
    'previewImage'
  ],
  setup(props) {
    const activeTab = ref('media')

    // Получаем другого участника чата
    const otherUser = computed(() => {
      if (!props.chat) return null
      
      // Пробуем participants
      if (props.chat.participants?.length) {
        const found = props.chat.participants.find(
          p => String(p.id) !== String(props.currentUserId)
        )
        if (found) return found
      }
      
      // Пробуем users (структура chatUser.user)
      if (props.chat.users?.length) {
        const chatUser = props.chat.users.find(
          cu => cu.user && String(cu.user.id) !== String(props.currentUserId)
        )
        if (chatUser?.user) return chatUser.user
      }
      
      return null
    })

    // Проверка онлайн статуса
    const isOnline = computed(() => {
      if (!otherUser.value) return false
      const userId = otherUser.value.id
      return props.onlineUsers.includes(userId) || 
             props.onlineUsers.includes(String(userId))
    })

    // Получаем медиа сообщения
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
      { id: 'media', label: 'Медиа', icon: 'fas fa-images', count: mediaMessages.value.length },
      { id: 'files', label: 'Файлы', icon: 'fas fa-file-alt', count: fileMessages.value.length },
      { id: 'links', label: 'Ссылки', icon: 'fas fa-link', count: linkMessages.value.length },
      { id: 'settings', label: 'Настройки', icon: 'fas fa-cog', count: 0 }
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
      activeTab,
      otherUser,
      isOnline,
      getUserAvatar,
      getUserFullName,
      formatFileSize,
      getFileIcon,
      formatDate,
      downloadFile,
      mediaMessages,
      fileMessages,
      linkMessages,
      tabs
    }
  }
}
</script>


<style scoped>
.chat-info-container {
  width: 420px;
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

.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #94a3b8;
  border: 3px solid #fff;
}

.status-indicator.online {
  background: #22c55e;
}

.info-section {
  margin-top: 12px;
}

.user-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.user-status {
  margin: 6px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.user-status.online {
  color: #22c55e;
}

.user-email {
  margin: 10px 0 0;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* Tabs */
.info-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 12px;
}

.tab-btn {
  flex: 1;
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
  overflow-y: auto;
  padding: 16px;
  min-height: 200px;
  max-height: 300px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: transparent;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
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

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}
</style>

<!-- Глобальные стили для переопределения Modal -->
<style>
.chat-info-modal .modal-body {
  overflow: hidden !important;
  padding: 0 !important;
}

.chat-info-modal .modal-content {
  overflow: hidden !important;
}
</style>