<template>
  <div 
    v-if="isVisible"
    class="notification"
    :class="type"
  >
    <div class="notification-content">
      <span class="notification-message">{{ message }}</span>
      <button class="notification-close" @click="close">×</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      isVisible: true
    }
  },
  mounted() {
    if (this.duration > 0) {
      setTimeout(this.close, this.duration)
    }
  },
  methods: {
    close() {
      this.isVisible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.success {
  background-color: #28a745;
  color: white;
}

.error {
  background-color: #dc3545;
  color: white;
}

.info {
  background-color: #17a2b8;
  color: white;
}

.warning {
  background-color: #ffc107;
  color: #000;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 