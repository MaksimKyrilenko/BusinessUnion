<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="edit-group-modal">
      <div class="modal-header">
        <h2>Редактировать группу</h2>
      </div>
      
      <div class="modal-body">
        <!-- Секция аватара -->
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerAvatarUpload">
            <img v-if="avatarPreview || groupAvatar" :src="avatarPreview || groupAvatar" alt="Аватар группы">
            <div v-else class="avatar-placeholder">
              <span>{{ getInitial(localName) }}</span>
            </div>
            <div class="avatar-overlay">
              <i class="fas fa-camera"></i>
            </div>
          </div>
          <input 
            ref="avatarInput"
            type="file" 
            accept="image/*" 
            @change="handleAvatarChange"
            style="display: none"
          >
          <span class="avatar-hint">Нажмите для изменения</span>
        </div>
        
        <div class="form-group">
          <label>Название группы</label>
          <input 
            type="text" 
            v-model="localName" 
            placeholder="Введите название группы"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Описание</label>
          <textarea 
            v-model="localDescription" 
            placeholder="Введите описание группы"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Отмена</button>
        <button class="btn btn-primary" @click="save" :disabled="!localName.trim() || saving">
          <span v-if="saving">Сохранение...</span>
          <span v-else>Сохранить</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { ref, watch, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import messengerService from '@/services/messenger.service'

export default {
  name: 'EditGroupModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    group: { type: Object, default: null }
  },
  emits: ['close', 'save', 'avatarUpdated'],
  setup(props, { emit }) {
    const localName = ref('')
    const localDescription = ref('')
    const avatarInput = ref(null)
    const avatarFile = ref(null)
    const avatarPreview = ref(null)
    const saving = ref(false)
    
    const groupAvatar = computed(() => {
      return props.group?.avatar || null
    })
    
    const getInitial = (name) => {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    }
    
    watch(() => props.show, (newVal) => {
      if (newVal && props.group) {
        localName.value = props.group.name || ''
        localDescription.value = props.group.description || ''
        avatarFile.value = null
        avatarPreview.value = null
      }
    })
    
    const triggerAvatarUpload = () => {
      avatarInput.value?.click()
    }
    
    const handleAvatarChange = (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение')
        return
      }
      
      // Проверяем размер (макс 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Размер файла не должен превышать 2MB')
        return
      }
      
      avatarFile.value = file
      
      // Создаём превью
      const reader = new FileReader()
      reader.onload = (e) => {
        avatarPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
    
    const save = async () => {
      if (!localName.value.trim() || saving.value) return
      
      saving.value = true
      
      try {
        // Если есть новый аватар, сначала загружаем его
        if (avatarFile.value && props.group?.id) {
          const formData = new FormData()
          formData.append('avatar', avatarFile.value)
          
          try {
            const avatarResponse = await messengerService.uploadGroupAvatar(props.group.id, formData)
            if (avatarResponse?.data?.avatarUrl) {
              emit('avatarUpdated', avatarResponse.data.avatarUrl)
            }
          } catch (error) {
            console.error('Ошибка при загрузке аватара:', error)
            // Продолжаем сохранение даже если аватар не загрузился
          }
        }
        
        // Сохраняем остальные данные
        emit('save', {
          name: localName.value.trim(),
          description: localDescription.value.trim()
        })
      } finally {
        saving.value = false
      }
    }
    
    return {
      localName,
      localDescription,
      avatarInput,
      avatarPreview,
      groupAvatar,
      saving,
      getInitial,
      triggerAvatarUpload,
      handleAvatarChange,
      save
    }
  }
}
</script>

<style scoped>
.edit-group-modal {
  width: 400px;
  max-width: 95vw;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-body {
  padding: 20px;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder span {
  font-size: 40px;
  font-weight: 600;
  color: #fff;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
  color: #fff;
}

.avatar-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #2196F3;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1976D2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
