<template>
  <div class="modal-overlay" @click="handleOutsideClick">
    <div class="modal-container" ref="modalContainer">
      <div class="modal-close" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </div>
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'Modal',
  emits: ['close'],
  setup(props, { emit }) {
    const modalContainer = ref(null);

    const handleOutsideClick = (event) => {
      if (modalContainer.value && !modalContainer.value.contains(event.target)) {
        emit('close');
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        emit('close');
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Предотвращаем прокрутку содержимого под модальным окном
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = ''; // Восстанавливаем прокрутку
    });

    return {
      modalContainer,
      handleOutsideClick
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  position: relative;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90%;
  width: auto;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #f2f2f2;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #e0e0e0;
}

.modal-close i {
  font-size: 14px;
  color: #555;
}

.modal-content {
  padding: 20px;
  max-height: calc(90vh - 40px);
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Стили для различных типов модальных окон */

/* Модальное окно информации о группе */
:deep(.group-info-modal) {
  width: 500px;
}

:deep(.group-header) {
  display: flex;
  margin-bottom: 20px;
}

:deep(.group-avatar) {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

:deep(.group-avatar img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.group-details h2) {
  margin: 0 0 8px;
  font-size: 22px;
}

:deep(.group-details p) {
  margin: 0 0 5px;
  color: #666;
}

:deep(.members-count) {
  font-size: 14px;
  color: #888;
}

:deep(.group-members) {
  margin-top: 20px;
}

:deep(.members-list) {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

:deep(.member-item) {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

:deep(.member-item:hover) {
  background-color: #f5f5f5;
}

:deep(.member-avatar) {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

:deep(.member-avatar img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.online-status) {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid #fff;
}

:deep(.online-status.online) {
  background-color: #4CAF50;
}

:deep(.member-info) {
  flex: 1;
}

:deep(.member-name) {
  font-weight: 500;
}

:deep(.member-role) {
  font-size: 12px;
  color: #888;
}

:deep(.member-actions) {
  display: flex;
}

:deep(.member-actions button) {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

:deep(.member-actions button:hover) {
  color: #f44336;
}

:deep(.group-actions) {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}

:deep(.group-actions button) {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
}

:deep(.group-actions button i) {
  margin-right: 8px;
}

:deep(.btn-primary) {
  background-color: #2196F3;
  color: white;
}

:deep(.btn-primary:hover) {
  background-color: #1976D2;
}

:deep(.btn-danger) {
  background-color: #f44336;
  color: white;
}

:deep(.btn-danger:hover) {
  background-color: #d32f2f;
}

:deep(.btn-secondary) {
  background-color: #e0e0e0;
  color: #333;
}

:deep(.btn-secondary:hover) {
  background-color: #bdbdbd;
}

/* Модальное окно редактирования сообщения */
:deep(.edit-message-modal) {
  width: 500px;
}

:deep(.edit-message-content) {
  margin: 15px 0;
}

:deep(.edit-message-textarea) {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

:deep(.modal-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Модальное окно пересылки сообщения */
:deep(.forward-message-modal) {
  width: 500px;
}

:deep(.forward-message-preview) {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

:deep(.message-preview .sender) {
  font-weight: 500;
  margin-bottom: 5px;
}

:deep(.message-preview .text) {
  color: #333;
}

:deep(.select-chat) {
  margin-top: 20px;
}

:deep(.chats-list) {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

:deep(.chat-select-item) {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.chat-select-item:hover) {
  background-color: #f0f0f0;
}

:deep(.chat-select-item.active) {
  background-color: #e3f2fd;
}

:deep(.chat-avatar) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

:deep(.chat-avatar img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.chat-name) {
  font-weight: 500;
}

/* Модальное окно для загрузки файлов */
:deep(.file-upload-modal) {
  width: 500px;
}

:deep(.file-drop-zone) {
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  margin: 15px 0;
  transition: all 0.2s;
  background-color: #f9f9f9;
}

:deep(.file-drop-zone.active) {
  border-color: #2196F3;
  background-color: #e3f2fd;
}

:deep(.file-drop-zone i) {
  font-size: 40px;
  color: #888;
  margin-bottom: 15px;
}

:deep(.select-file-btn) {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.2s;
}

:deep(.select-file-btn:hover) {
  background-color: #1976D2;
}

:deep(.selected-file-preview) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.image-preview) {
  max-width: 100%;
  margin-bottom: 15px;
}

:deep(.image-preview img) {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
}

:deep(.file-info) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  width: 100%;
}

:deep(.file-size) {
  color: #888;
  font-size: 12px;
  margin-left: auto;
}

:deep(.remove-file-btn) {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
}

:deep(.remove-file-btn:hover) {
  background-color: #d32f2f;
}

:deep(.upload-progress) {
  margin-top: 15px;
  width: 100%;
}

:deep(.progress-bar) {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.progress-bar-fill) {
  height: 100%;
  background-color: #2196F3;
  transition: width 0.2s;
}

:deep(.progress-text) {
  text-align: center;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

/* Модальное окно создания группы */
:deep(.create-group-modal) {
  width: 500px;
}

:deep(.modal-header) {
  margin-bottom: 20px;
}

:deep(.modal-header h3) {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

:deep(.create-group-form) {
  display: flex;
  flex-direction: column;
}

:deep(.form-group) {
  margin-bottom: 20px;
}

:deep(.form-group label) {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

:deep(.form-group input,
.form-group textarea) {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

:deep(.form-actions) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.search-results) {
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.user-item) {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

:deep(.user-item:hover) {
  background-color: #f5f5f5;
}

:deep(.selected-users) {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.selected-user) {
  display: flex;
  align-items: center;
  background-color: #e3f2fd;
  padding: 5px 10px;
  border-radius: 16px;
}

:deep(.selected-user .remove) {
  margin-left: 5px;
  cursor: pointer;
  color: #888;
}

:deep(.selected-user .remove:hover) {
  color: #f44336;
}
</style> 