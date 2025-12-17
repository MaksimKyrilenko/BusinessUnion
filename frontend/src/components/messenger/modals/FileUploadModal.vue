<template>
  <Modal :show="show" @close="$emit('cancel')">
    <div class="file-upload-modal">
      <div class="modal-header">
        <h3>{{ isImage ? 'Загрузка изображения' : 'Загрузка файла' }}</h3>
      </div>
      <div class="file-upload-content">
        <div 
          class="file-drop-zone" 
          @dragover.prevent="$emit('dragOver', true)" 
          @dragleave.prevent="$emit('dragOver', false)" 
          @drop.prevent="$emit('drop', $event)"
          :class="{ active: isDragOver }"
        >
          <div v-if="!selectedFile">
            <i class="fas" :class="isImage ? 'fa-image' : 'fa-file-alt'"></i>
            <p>Перетащите {{ isImage ? 'изображение' : 'файл' }} сюда или нажмите для выбора</p>
            <div class="drag-hint">
              <i class="fas fa-hand-point-up"></i>
              Поддерживается перетаскивание (drag & drop)
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              @change="$emit('select', $event)" 
              :accept="isImage ? 'image/*' : '*'" 
              style="display: none;"
            >
            <button class="select-file-btn" @click="$refs.fileInput.click()">
              <i class="fas" :class="isImage ? 'fa-image' : 'fa-file-upload'"></i>
              Выбрать {{ isImage ? 'изображение' : 'файл' }}
            </button>
          </div>
          <div v-else class="selected-file-preview">
            <div v-if="isImage && previewUrl" class="image-preview">
              <img :src="previewUrl" alt="Предпросмотр">
            </div>
            <div v-else class="file-info">
              <i class="fas" :class="getFileIcon(selectedFile.name)"></i>
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <button class="remove-file-btn" @click="$emit('remove')">
              <i class="fas fa-trash-alt"></i> Удалить
            </button>
          </div>
        </div>
        
        <div v-if="progress > 0 && progress < 100" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="progress-text">
            <i class="fas fa-sync-alt"></i>
            Загрузка {{ progress }}%
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('cancel')">
          <i class="fas fa-times"></i>
          Отмена
        </button>
        <button 
          class="btn-primary" 
          @click="$emit('upload')" 
          :disabled="!selectedFile || uploading"
        >
          <i class="fas" :class="uploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
          {{ uploading ? 'Загрузка...' : 'Отправить' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/ui/Modal.vue'
import { formatFileSize, getFileIcon } from '@/utils/messageFormatters'

export default {
  name: 'FileUploadModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    isImage: { type: Boolean, default: false },
    selectedFile: { type: Object, default: null },
    previewUrl: { type: String, default: '' },
    progress: { type: Number, default: 0 },
    uploading: { type: Boolean, default: false },
    isDragOver: { type: Boolean, default: false }
  },
  emits: ['cancel', 'upload', 'select', 'remove', 'drop', 'dragOver'],
  setup() {
    return { formatFileSize, getFileIcon }
  }
}
</script>

<style scoped>
.file-upload-modal {
  width: 500px;
  max-width: 90vw;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.file-upload-content {
  padding: 24px;
}

.file-drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.file-drop-zone.active {
  border-color: #2196F3;
  background: #eff6ff;
}

.file-drop-zone i {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.file-drop-zone p {
  color: #64748b;
  margin-bottom: 12px;
}

.drag-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.select-file-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.select-file-btn:hover {
  background: #1976D2;
}

.selected-file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  object-fit: contain;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-info i {
  font-size: 48px;
  color: #2196F3;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.file-size {
  font-size: 12px;
  color: #94a3b8;
}

.remove-file-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fef2f2;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.remove-file-btn:hover {
  background: #fee2e2;
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #2196F3;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f1f5f9;
  border: none;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #2196F3;
  border: none;
  color: #fff;
}

.btn-primary:hover {
  background: #1976D2;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
