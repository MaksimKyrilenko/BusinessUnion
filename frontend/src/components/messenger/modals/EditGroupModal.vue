<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="edit-group-modal">
      <div class="modal-header">
        <h2>Редактировать группу</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
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
        <button class="btn btn-primary" @click="save" :disabled="!localName.trim()">Сохранить</button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'

export default {
  name: 'EditGroupModal',
  components: { Modal },
  props: {
    show: { type: Boolean, default: false },
    group: { type: Object, default: null }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const localName = ref('')
    const localDescription = ref('')
    
    watch(() => props.show, (newVal) => {
      if (newVal && props.group) {
        localName.value = props.group.name || ''
        localDescription.value = props.group.description || ''
      }
    })
    
    const save = () => {
      if (!localName.value.trim()) return
      emit('save', {
        name: localName.value.trim(),
        description: localDescription.value.trim()
      })
    }
    
    return {
      localName,
      localDescription,
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

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.modal-body {
  padding: 20px;
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
