<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="closeOnClickOutside && close()">
        <div class="modal-container" :class="{ 'large': size === 'large' }" @click.stop>
          <div class="modal-header" v-if="$slots.header || showCloseButton || title">
            <slot name="header">
              <h3 v-if="title" class="modal-title">{{ title }}</h3>
            </slot>
            <button v-if="showCloseButton" class="modal-close" @click="close">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { watch } from 'vue';

export default {
  name: 'BaseModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const close = () => {
      emit('update:modelValue', false);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape' && props.closeOnEsc && props.modelValue) {
        close();
      }
    };

    // Добавляем/удаляем обработчик клавиши Escape
    watch(() => props.modelValue, (value) => {
      if (value) {
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку
      } else {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = ''; // Разблокируем прокрутку
      }
    });

    return {
      close
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
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-container.large {
  max-width: 800px;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #212529;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.15s ease;
}

.modal-close:hover {
  color: #343a40;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Анимации */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 576px) {
  .modal-container {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .modal-overlay {
    padding: 0;
  }
}
</style> 