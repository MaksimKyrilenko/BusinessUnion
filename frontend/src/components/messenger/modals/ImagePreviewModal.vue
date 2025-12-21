<template>
  <Teleport to="body">
    <Transition name="image-modal">
      <div v-if="show" class="image-preview-overlay" @click.self="$emit('close')">
        <div class="image-preview-container" v-if="message">
          <div class="preview-header">
            <div class="sender-info">
              <img :src="getUserAvatar(message.sender)" :alt="getUserFullName(message.sender)">
              <div>
                <span class="sender-name">{{ getUserFullName(message.sender) }}</span>
                <span class="send-time">{{ formatTime(message.createdAt || message.timestamp) }}</span>
              </div>
            </div>
            <div class="preview-actions">
              <button @click="$emit('download')" title="Скачать">
                <i class="fas fa-download"></i>
              </button>
              <button @click="$emit('close')" title="Закрыть">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="preview-content">
            <img :src="message.fileUrl || message.url" :alt="message.fileName || 'Изображение'">
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { getUserAvatar, getUserFullName, formatTime } from '@/utils/messageFormatters'

export default {
  name: 'ImagePreviewModal',
  props: {
    show: { type: Boolean, default: false },
    message: { type: Object, default: null }
  },
  emits: ['close', 'download'],
  setup(props, { emit }) {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && props.show) {
        emit('close')
      }
    }

    watch(() => props.show, (isVisible) => {
      if (isVisible) {
        document.addEventListener('keydown', handleEscapeKey)
      } else {
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }, { immediate: true })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscapeKey)
    })

    return { getUserAvatar, getUserFullName, formatTime }
  }
}
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.image-preview-container {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.8);
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.sender-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.send-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-actions button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-actions button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #000;
}

.preview-content img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

/* Transitions */
.image-modal-enter-active {
  transition: opacity 0.3s ease;
}

.image-modal-enter-active .image-preview-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.image-modal-leave-active {
  transition: opacity 0.2s ease;
}

.image-modal-leave-active .image-preview-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.image-modal-enter-from {
  opacity: 0;
}

.image-modal-enter-from .image-preview-container {
  opacity: 0;
  transform: scale(0.9);
}

.image-modal-leave-to {
  opacity: 0;
}

.image-modal-leave-to .image-preview-container {
  opacity: 0;
  transform: scale(0.95);
}
</style>
