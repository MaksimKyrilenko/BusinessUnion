<template>
  <div class="main-chat-header" v-if="chat">
    <div 
      class="chat-info" 
      @click="chat.type === 'group' ? $emit('showGroupInfo') : null" 
      :class="{ 'clickable': chat.type === 'group' }"
    >
      <img :src="avatarUrl" :alt="chatName">
      <div>
        <h2>{{ chatName }}</h2>
        <span v-if="isTyping" class="typing-status">
          <span class="typing-dots">
            <span></span><span></span><span></span>
          </span>
          печатает...
        </span>
        <span v-else :class="['status', { 'status-online': isOnline }]">
          {{ statusText }}
        </span>
      </div>
    </div>
    <div class="chat-actions" v-if="chat.type === 'personal'">
      <button @click="$emit('showSettings')">
        <i class="fas fa-ellipsis-v"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { getUserAvatar, getUserFullName } from '@/utils/messageFormatters'

export default {
  name: 'ChatHeader',
  props: {
    chat: { type: Object, default: null },
    currentUserId: { type: [String, Number], default: null },
    membersCount: { type: Number, default: 0 },
    isTyping: { type: Boolean, default: false },
    onlineUsers: { type: Array, default: () => [] }
  },
  emits: ['showGroupInfo', 'showSettings'],
  setup(props) {
    // Получаем другого участника для личных чатов
    const otherParticipant = computed(() => {
      if (props.chat?.type !== 'personal' || !props.chat.participants?.length) {
        return null
      }
      return props.chat.participants.find(
        p => String(p.id) !== String(props.currentUserId)
      )
    })

    const avatarUrl = computed(() => {
      if (!props.chat) return '/assets/images/default-avatar.svg'
      
      if (otherParticipant.value) {
        return getUserAvatar(otherParticipant.value)
      }
      
      return props.chat.avatar || '/assets/images/default-avatar.svg'
    })

    const chatName = computed(() => {
      if (!props.chat) return 'Чат'
      
      if (otherParticipant.value) {
        return getUserFullName(otherParticipant.value)
      }
      
      return props.chat.name || 'Чат'
    })

    // Проверка онлайн статуса собеседника
    const isOnline = computed(() => {
      if (!otherParticipant.value) return false
      const oderId = otherParticipant.value.id
      return props.onlineUsers.includes(oderId) || 
             props.onlineUsers.includes(String(oderId))
    })

    // Форматирование статуса
    const statusText = computed(() => {
      if (props.chat?.type === 'group') {
        return `${props.membersCount} участников`
      }
      
      if (isOnline.value) {
        return 'В сети'
      }
      
      // Показываем "был в сети" если есть lastSeen
      if (otherParticipant.value?.lastSeen) {
        return formatLastSeen(otherParticipant.value.lastSeen)
      }
      
      return 'Не в сети'
    })

    // Форматирование времени последнего визита
    const formatLastSeen = (lastSeen) => {
      if (!lastSeen) return 'Не в сети'
      
      const date = new Date(lastSeen)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'был(а) только что'
      if (diffMins < 60) return `был(а) ${diffMins} мин. назад`
      if (diffHours < 24) return `был(а) ${diffHours} ч. назад`
      if (diffDays === 1) return 'был(а) вчера'
      if (diffDays < 7) return `был(а) ${diffDays} дн. назад`
      
      return `был(а) ${date.toLocaleDateString('ru-RU')}`
    }

    return {
      avatarUrl,
      chatName,
      isOnline,
      statusText
    }
  }
}
</script>

<style scoped>
.main-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-info.clickable {
  cursor: pointer;
}

.chat-info.clickable:hover {
  opacity: 0.8;
}

.chat-info img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-info h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.chat-info .status {
  font-size: 13px;
  color: #64748b;
}

.chat-info .status-online {
  color: #22c55e;
}

.chat-info .typing-status {
  font-size: 13px;
  color: #2196F3;
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-dots {
  display: flex;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #2196F3;
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-actions button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.chat-actions button:hover {
  background: #f1f5f9;
  color: #334155;
}
</style>
