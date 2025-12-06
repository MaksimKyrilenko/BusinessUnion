<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container" ref="modalContainer">
      <div class="modal-close" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </div>
      <div class="modal-content">
        <div class="modal-header" v-if="$slots.header">
          <slot name="header"></slot>
        </div>
        <div class="modal-body" v-if="$slots.body">
          <slot name="body"></slot>
        </div>
        <div class="modal-body" v-if="$slots.default">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const modalContainer = ref(null);

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && props.show) {
        emit('close');
      }
    };

    watch(() => props.show, (isVisible) => {
      if (isVisible) {
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
      } else {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = '';
      }
    }, { immediate: true });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    });

    return {
      modalContainer
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
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  max-height: 90vh;
  width: auto;
  overflow: hidden;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-close:hover {
  background-color: rgba(0, 0, 0, 0.15);
  transform: rotate(90deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-close i {
  font-size: 16px;
  color: white;
}

.modal-content {
  padding: 0; /* Убираем отступы, чтобы контент мог использовать все пространство */
  max-height: calc(90vh - 40px);
  overflow: hidden; /* Скрываем полосы прокрутки на уровне modal-content */
  display: flex;
  flex-direction: column;
  min-width: 450px;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8f9fa;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-30px); opacity: 0; }
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
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
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
  width: 700px;
  max-width: 90vw;
  min-height: 500px;
  padding: 30px;
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff, #f8faff);
}

:deep(.file-upload-modal h3) {
  font-size: 24px;
  color: #2196F3;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

:deep(.file-drop-zone) {
  border: 3px dashed #b0d8ff;
  border-radius: 20px;
  padding: 50px 40px;
  text-align: center;
  margin: 25px 0;
  transition: all 0.4s ease;
  background-color: rgba(33, 150, 243, 0.03);
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 20px rgba(33, 150, 243, 0.05);
}

:deep(.file-drop-zone.active) {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.08);
  transform: scale(1.02);
  box-shadow: inset 0 0 30px rgba(33, 150, 243, 0.1);
}

:deep(.file-drop-zone i) {
  font-size: 70px;
  color: #2196F3;
  margin-bottom: 25px;
  opacity: 0.8;
  filter: drop-shadow(0 5px 10px rgba(33, 150, 243, 0.3));
}

:deep(.file-drop-zone p) {
  font-size: 18px;
  color: #555;
  margin: 0 0 20px;
  max-width: 80%;
  line-height: 1.5;
}

:deep(.file-drop-zone .drag-hint) {
  font-size: 14px;
  color: #888;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.file-drop-zone .drag-hint i) {
  font-size: 16px;
  margin: 0;
  color: #888;
  filter: none;
}

:deep(.select-file-btn) {
  padding: 14px 32px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 25px;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 15px rgba(33, 150, 243, 0.3);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

:deep(.select-file-btn::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

:deep(.select-file-btn:hover) {
  background: linear-gradient(135deg, #1E88E5, #1565C0);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.5);
}

:deep(.select-file-btn:hover::before) {
  left: 100%;
}

:deep(.selected-file-preview) {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
  animation: fadeIn 0.5s ease;
}

:deep(.image-preview) {
  max-width: 100%;
  margin-bottom: 25px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

:deep(.image-preview::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.1));
  pointer-events: none;
  z-index: 1;
}

:deep(.image-preview img) {
  max-width: 100%;
  max-height: 350px;
  border-radius: 12px;
  object-fit: contain;
  transition: transform 0.5s ease;
}

:deep(.image-preview:hover img) {
  transform: scale(1.02);
}

:deep(.file-info) {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 25px;
  background: linear-gradient(145deg, #f8faff, #e6f3ff);
  border-radius: 15px;
  width: 100%;
  border: 1px solid rgba(33, 150, 243, 0.2);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

:deep(.file-info:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

:deep(.file-info i) {
  font-size: 24px;
  color: #2196F3;
}

:deep(.file-name) {
  font-weight: 500;
  color: #333;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

:deep(.file-size) {
  color: #777;
  font-size: 13px;
  margin-left: auto;
  background: rgba(33, 150, 243, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

:deep(.remove-file-btn) {
  padding: 10px 20px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.remove-file-btn i) {
  font-size: 14px;
}

:deep(.remove-file-btn:hover) {
  background: linear-gradient(135deg, #e53935, #c62828);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(244, 67, 54, 0.4);
}

:deep(.upload-progress) {
  margin-top: 25px;
  width: 100%;
}

:deep(.progress-bar) {
  width: 100%;
  height: 12px;
  background: linear-gradient(145deg, #f0f0f0, #e6e6e6);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

:deep(.progress-bar-fill) {
  height: 100%;
  background: linear-gradient(90deg, #2196F3, #03A9F4);
  border-radius: 20px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

:deep(.progress-bar-fill::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%
  );
  background-size: 20px 20px;
  animation: progressAnimation 1s linear infinite;
  z-index: 1;
}

@keyframes progressAnimation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
}

:deep(.progress-text) {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Стили кнопок в модальных окнах */
:deep(.btn-primary), :deep(.btn-secondary) {
  padding: 14px 32px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:deep(.btn-primary) {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  box-shadow: 0 6px 15px rgba(33, 150, 243, 0.3);
}

:deep(.btn-primary::before), :deep(.btn-secondary::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

:deep(.btn-primary:hover) {
  background: linear-gradient(135deg, #1E88E5, #1565C0);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.4);
}

:deep(.btn-primary:hover::before), :deep(.btn-secondary:hover::before) {
  left: 100%;
}

:deep(.btn-primary:disabled) {
  background: linear-gradient(135deg, #90caf9, #64b5f6);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 10px rgba(33, 150, 243, 0.2);
  opacity: 0.7;
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  color: #333;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #eeeeee, #bdbdbd);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

:deep(.btn-secondary:hover) {
  background-color: #e0e0e0;
  transform: translateY(-2px);
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