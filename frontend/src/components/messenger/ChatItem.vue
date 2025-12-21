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
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatTime, getUserAvatar } from '@/utils/messageFormatters'

export default {
  name: 'ChatItem',
  props: {
    chat: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    currentUserId: { type: [String, Number], default: null },
    onlineUsers: { type: Array, default: () => [] }
  },
  emits: ['select'],
  setup(props) {
    // Получаем другого участника для личных чатов
    const otherParticipant = computed(() => {
      if (props.chat.type !== 'personal') return null
      
      if (props.chat.participants?.length) {
        const found = props.chat.participants.find(
          p => String(p.id) !== String(props.currentUserId)
        )
        if (found) return found
      }
      
      if (props.chat.users?.length) {
        const chatUser = props.chat.users.find(
          cu => cu.user && String(cu.user.id) !== String(props.currentUserId)
        )
        if (chatUser?.user) return chatUser.user
      }
      
      return null
    })

    const chatDisplayName = computed(() => {
      if (props.chat.type === 'group') {
        return props.chat.name || 'Группа'
      }
      
      if (otherParticipant.value) {
        const firstName = otherParticipant.value.firstName || ''
        const lastName = otherParticipant.value.lastName || ''
        let fullName = [firstName, lastName].filter(Boolean).join(' ')
        if (fullName) return fullName
        
        if (otherParticipant.value.profile) {
          const profileFirstName = otherParticipant.value.profile.firstName || ''
          const profileLastName = otherParticipant.value.profile.lastName || ''
          fullName = [profileFirstName, profileLastName].filter(Boolean).join(' ')
          if (fullName) return fullName
        }
        
        if (otherParticipant.value.name) return otherParticipant.value.name
        if (otherParticipant.value.email) return otherParticipant.value.email.split('@')[0]
      }
      
      if (props.chat.name) return props.chat.name
      return 'Чат'
    })

    const avatarUrl = computed(() => {
      if (props.chat.type === 'group') {
        return props.chat.avatar || '/assets/images/default-avatar.svg'
      }
      if (otherParticipant.value) {
        return getUserAvatar(otherParticipant.value)
      }
      return '/assets/images/default-avatar.svg'
    })

    const onlineStatus = computed(() => {
      if (props.chat.type === 'group') return 'group'
      if (otherParticipant.value) {
        const isOnline = props.onlineUsers.includes(otherParticipant.value.id) ||
                         props.onlineUsers.includes(String(otherParticipant.value.id))
        return isOnline ? 'online' : 'offline'
      }
      return 'offline'
    })

    const lastMessageTime = computed(() => {
      if (props.chat.lastMessage?.createdAt) return props.chat.lastMessage.createdAt
      if (props.chat.lastMessage?.timestamp) return props.chat.lastMessage.timestamp
      if (props.chat.messages?.length > 0) {
        const lastMsg = props.chat.messages[props.chat.messages.length - 1]
        return lastMsg.createdAt || lastMsg.timestamp
      }
      return props.chat.updatedAt || props.chat.createdAt
    })

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
  display: none;
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
</style>
