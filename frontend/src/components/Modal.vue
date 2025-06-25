<template>
  <transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-content">
        <button class="modal-close" @click="$emit('close')">&times;</button>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 0;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: none;
  animation: modalAppear 0.3s ease-out;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f1f5f9;
  border: none;
  font-size: 1.4rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
}

.modal-close:hover {
  color: #334155;
  background: #f9fafb;
  transform: rotate(90deg);
}

/* Анимации */
@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter-active {
  animation: modalAppear 0.3s ease-out;
}

.modal-leave-active {
  animation: modalAppear 0.3s ease-out reverse;
}

/* Стилизация скроллбара */
.modal-content::-webkit-scrollbar {
  width: 6px;
  position: absolute;
  right: 0;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(33, 150, 243, 0.05);
  border-radius: 0 1rem 1rem 0;
  margin: 3rem 0; /* Отступы сверху и снизу */
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(33, 150, 243, 0.2);
  border-radius: 3px;
  border: 1px solid rgba(33, 150, 243, 0.1);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(33, 150, 243, 0.3);
}
</style> 