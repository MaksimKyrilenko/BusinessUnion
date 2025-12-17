<template>
  <div v-if="isTyping" class="typing-indicator">
    <span class="typing-text">{{ typingText }}</span>
    <span class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TypingIndicator',
  props: {
    users: {
      type: Array,
      default: () => [],
    },
    userNames: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const isTyping = computed(() => props.users.length > 0);

    const typingText = computed(() => {
      if (props.users.length === 0) return '';
      
      if (props.users.length === 1) {
        const name = props.userNames[props.users[0]] || 'Кто-то';
        return `${name} печатает`;
      }
      
      if (props.users.length === 2) {
        const names = props.users.map(id => props.userNames[id] || 'Кто-то');
        return `${names.join(' и ')} печатают`;
      }
      
      return `${props.users.length} человек печатают`;
    });

    return {
      isTyping,
      typingText,
    };
  },
};
</script>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #64748b;
}

.typing-text {
  font-style: italic;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: #64748b;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
