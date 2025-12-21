<template>
  <span class="online-status" :class="statusClass" :title="statusText">
    <span class="status-dot"></span>
    <span v-if="showText" class="status-text">{{ statusText }}</span>
  </span>
</template>

<script>
import { computed } from 'vue';
import websocketService from '@/services/websocket.service';

export default {
  name: 'OnlineStatus',
  props: {
    userId: {
      type: [Number, String],
      required: true,
    },
    showText: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isOnline = computed(() => {
      const id = typeof props.userId === 'string' ? parseInt(props.userId) : props.userId;
      return websocketService.isUserOnline(id);
    });

    const statusClass = computed(() => ({
      'online': isOnline.value,
      'offline': !isOnline.value,
    }));

    const statusText = computed(() => isOnline.value ? 'В сети' : 'Не в сети');

    return {
      isOnline,
      statusClass,
      statusText,
    };
  },
};
</script>

<style scoped>
.online-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.online .status-dot {
  background-color: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.offline .status-dot {
  background-color: #9ca3af;
}

.status-text {
  font-size: 0.75rem;
  color: inherit;
}

.online .status-text {
  color: #22c55e;
}

.offline .status-text {
  color: #9ca3af;
}
</style>
