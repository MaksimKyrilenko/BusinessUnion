<template>
  <Modal :show="show" @close="$emit('close')" class="image-preview-modal">
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
  </Modal>
</template>

<script>
import Modal from '@/components/ui/Modal.vue'
import { getUserAvatar, getUserFullName, formatTime } from '@/utils/messageFormatters'

export default {
  name: 'ImagePreviewModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    message: { type: Object, default: null }
  },
  emits: ['close', 'download'],
  setup() {
    return { getUserAvatar, getUserFullName, formatTime }
  }
}
</script>

<style scoped>
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
</style>
