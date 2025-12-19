<template>
  <div
    :class="['chat-item', { active: selected, 'has-unread': chat.unreadCount > 0 }]"
    @click="$emit('select')"
  >
    <div class="chat-avatar">
      <img :src="avatarUrl" :alt="chatDisplayName">
      <span class="status-indicator" :class="onlineStatus"></span>
    </div>
    <div class="chat-info">
      <div class="chat-header">
        <div class="chat-title">
          <h3>{{ chatDisplayName }}</h3>
          <span v-if="chat.isPinned" class="pin-indicator" title="Закреплённый чат">📌</span>
          <span v-if="chat.isMuted" class="mute-indicator" title="Уведомления отключены">🔕</span>
        </div>
        <span class="chat-time">{{ formatTime(lastMessageTime) }}</span>
      </div>
      <p :class="['chat-preview', { 'chat-preview-unread': chat.unreadCount > 0 }]">
        <span v-if="chat.lastMessage?.type === 'image'" class="message-type-indicator">📷 Фото</span>
        <span v-else-if="chat.lastMessage?.type === 'file'" class="message-type-indicator">📎 Файл</span>
        <span v-else>{{ lastMessageText }}</span>
      </p>
      <div class="chat-meta">
        <span v-if="chat.typing" class="typing-indicator">печатает...</span>
        <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}</span>
      </div>
    </div>
    <div class="chat-actions-menu">
      <button class="action-btn" @click.stop="$emit('toggleMenu')">⋮</button>
      <div v-if="chat.showMenu" class="chat-menu">
        <button @click.stop="$emit('pin')">
          {{ chat.isPinned ? 'Открепить' : 'Закрепить' }}
        </button>
        <button @click.stop="$emit('markUnread')">
          Отметить как непрочитанное
        </button>
        <button @click.stop="$emit('mute')">
          {{ chat.isMuted ? 'Включить уведомления' : 'Отключить уведомления' }}
        </button>
        <button v-if="chat.type === 'group'" @click.stop="$emit('leave')" class="danger">
          Покинуть группу
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatTime, getUserAvatar, getUserFullName } from '@/utils/messageFormatters'

export default {
  name: 'ChatItem',
  props: {
    chat: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    currentUserId: { type: [String, Number], default: null },
    onlineUsers: { type: Array, default: () => [] }
  },
  emits: ['select', 'toggleMenu', 'pin', 'markUnread', 'mute', 'leave'],
  setup(props) {
    // Получаем другого участника для личных чатов
    const otherParticipant = computed(() => {
      if (props.chat.type !== 'personal' || !props.chat.participants?.length) {
        return null
      }
      return props.chat.participants.find(
        p => String(p.id) !== String(props.currentUserId)
      )
    })

    // Имя чата - для личных показываем имя и фамилию собеседника
    const chatDisplayName = computed(() => {
      if (props.chat.type === 'group') {
        return props.chat.name || 'Группа'
      }
      
      // Для личных чатов показываем имя собеседника
      if (otherParticipant.value) {
        // Пробуем прямые поля
        const firstName = otherParticipant.value.firstName || ''
        const lastName = otherParticipant.value.lastName || ''
        let fullName = [firstName, lastName].filter(Boolean).join(' ')
        if (fullName) return fullName
        
        // Пробуем profile
        if (otherParticipant.value.profile) {
          const profileFirstName = otherParticipant.value.profile.firstName || ''
          const profileLastName = otherParticipant.value.profile.lastName || ''
          fullName = [profileFirstName, profileLastName].filter(Boolean).join(' ')
          if (fullName) return fullName
        }
        
        // Пробуем name
        if (otherParticipant.value.name) {
          return otherParticipant.value.name
        }
        
        // Пробуем email
        if (otherParticipant.value.email) {
          return otherParticipant.value.email.split('@')[0]
        }
      }
      
      // Fallback - используем chat.name если есть (там может быть имя)
      if (props.chat.name) {
        return props.chat.name
      }
      
      return 'Чат'
    })

    // Аватар
    const avatarUrl = computed(() => {
      if (props.chat.type === 'group') {
        return props.chat.avatar || '/assets/images/default-avatar.svg'
      }
      
      if (otherParticipant.value) {
        return getUserAvatar(otherParticipant.value)
      }
      
      return '/assets/images/default-avatar.svg'
    })

    // Статус онлайн
    const onlineStatus = computed(() => {
      if (props.chat.type === 'group') {
        return 'group' // Для групп не показываем статус
      }
      
      if (otherParticipant.value) {
        const isOnline = props.onlineUsers.includes(otherParticipant.value.id) ||
                         props.onlineUsers.includes(String(otherParticipant.value.id))
        return isOnline ? 'online' : 'offline'
      }
      
      return 'offline'
    })

    // Время последнего сообщения
    const lastMessageTime = computed(() => {
      if (props.chat.lastMessage?.createdAt) {
        return props.chat.lastMessage.createdAt
      }
      if (props.chat.lastMessage?.timestamp) {
        return props.chat.lastMessage.timestamp
      }
      if (props.chat.messages?.length > 0) {
        const lastMsg = props.chat.messages[props.chat.messages.length - 1]
        return lastMsg.createdAt || lastMsg.timestamp
      }
      return props.chat.updatedAt || props.chat.createdAt
    })

    // Текст последнего сообщения
    const lastMessageText = computed(() => {
      let text = ''
      let senderName = ''
      
      if (props.chat.lastMessage?.text) {
        text = props.chat.lastMessage.text
        if (props.chat.type === 'group' && props.chat.lastMessage.sender) {
          senderName = props.chat.lastMessage.sender.firstName || ''
        }
      } else if (props.chat.messages?.length > 0) {
        const lastMsg = props.chat.messages[props.chat.messages.length - 1]
        text = lastMsg.text || 'Сообщение'
        if (props.chat.type === 'group' && lastMsg.sender) {
          senderName = lastMsg.sender.firstName || ''
        }
      } else {
        return 'Нет сообщений'
      }
      
      // Для групп показываем имя отправителя
      if (senderName && props.chat.type === 'group') {
        return `${senderName}: ${text}`
      }
      
      return text
    })

    return {
      avatarUrl,
      chatDisplayName,
      onlineStatus,
      lastMessageTime,
      lastMessageText,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.chat-item:hover {
  background: #f8fafc;
}

.chat-item.active {
  background: #eff6ff;
  border-left: 3px solid #2196F3;
}

.chat-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.chat-avatar img {
  width: 48px;
  height: 48px;
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
  border: 2px solid #fff;
}

.status-indicator.online {
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.status-indicator.offline {
  background: #94a3b8;
}

.status-indicator.group {
  display: none; /* Скрываем индикатор для групп */
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pin-indicator,
.mute-indicator {
  font-size: 12px;
}

.chat-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.chat-preview {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-preview-unread {
  color: #1e293b;
  font-weight: 500;
}

/* Маркировка непрочитанных чатов */
.chat-item.has-unread {
  background: #f0f9ff;
}

.chat-item.has-unread .chat-title h3 {
  font-weight: 700;
}

.message-type-indicator {
  color: #2196F3;
}

.chat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.typing-indicator {
  font-size: 12px;
  color: #2196F3;
  font-style: italic;
}

.unread-badge {
  background: #2196F3;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.chat-actions-menu {
  position: relative;
}

.chat-actions-menu .action-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.chat-actions-menu .action-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.chat-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
}

.chat-menu button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
  color: #334155;
  transition: background 0.2s ease;
}

.chat-menu button:hover {
  background: #f1f5f9;
}

.chat-menu button.danger {
  color: #ef4444;
}

.chat-menu button.danger:hover {
  background: #fef2f2;
}
</style>
