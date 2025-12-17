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
        <span v-if="chat.type === 'personal'" class="status">
          {{ chat.status === 'online' ? 'В сети' : 'Не в сети' }}
        </span>
        <span v-else class="members-count">
          {{ membersCount }} участников
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
    membersCount: { type: Number, default: 0 }
  },
  emits: ['showGroupInfo', 'showSettings'],
  setup(props) {
    const avatarUrl = computed(() => {
      if (!props.chat) return '/assets/images/default-avatar.svg'
      
      if (props.chat.type === 'personal' && props.chat.participants?.length) {
        const otherUser = props.chat.participants.find(
          p => String(p.id) !== String(props.currentUserId)
        )
        return getUserAvatar(otherUser)
      }
      
      return props.chat.avatar || '/assets/images/default-avatar.svg'
    })

    const chatName = computed(() => {
      if (!props.chat) return 'Чат'
      
      if (props.chat.type === 'personal' && props.chat.participants?.length) {
        const otherUser = props.chat.participants.find(
          p => String(p.id) !== String(props.currentUserId)
        )
        return getUserFullName(otherUser)
      }
      
      return props.chat.name || 'Чат'
    })

    return {
      avatarUrl,
      chatName
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
  color: #22c55e;
}

.chat-info .members-count {
  font-size: 13px;
  color: #64748b;
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
