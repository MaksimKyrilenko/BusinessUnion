<template>
  <div class="messages-container" ref="container">
    <template v-for="(group, date) in groupedMessages" :key="date">
      <div class="date-separator">
        <span class="date-label">{{ formatDate(date) }}</span>
      </div>
      <MessageItem
        v-for="message in group" 
        :key="message.id"
        :message="message"
        :isOwn="isOwnMessage(message)"
        @reply="$emit('reply', message)"
        @edit="$emit('edit', message)"
        @showReactions="$emit('showReactions', message)"
        @toggleReaction="(reaction) => $emit('toggleReaction', message, reaction)"
        @scrollToReply="$emit('scrollToMessage', message.replyTo?.id)"
        @downloadFile="$emit('downloadFile', message)"
        @downloadImage="$emit('downloadImage', message)"
        @showImagePreview="$emit('showImagePreview', message)"
      />
    </template>
  </div>
</template>

<script>
import { ref } from 'vue'
import MessageItem from './MessageItem.vue'
import { formatDate } from '@/utils/messageFormatters'

export default {
  name: 'MessageList',
  components: { MessageItem },
  props: {
    groupedMessages: { type: Object, default: () => ({}) },
    isOwnMessage: { type: Function, required: true }
  },
  emits: [
    'reply',
    'edit',
    'showReactions',
    'toggleReaction',
    'scrollToMessage',
    'downloadFile',
    'downloadImage',
    'showImagePreview'
  ],
  setup() {
    const container = ref(null)

    const scrollToBottom = () => {
      if (container.value) {
        container.value.scrollTop = container.value.scrollHeight
      }
    }

    return {
      container,
      formatDate,
      scrollToBottom
    }
  }
}
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

.date-label {
  background: #e2e8f0;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
</style>
