<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content create-group-modal" @click.stop>
      <button class="modal-close" @click="$emit('close')">&times;</button>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  mounted() {
    document.body.style.overflow = 'hidden'
  },
  unmounted() {
    document.body.style.overflow = 'auto'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  position: relative;
  min-width: 300px;
}

.modal-content.create-group-modal {
  width: 560px !important;
  max-width: 560px !important;
  padding: 0 !important;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  z-index: 1;
}

.modal-close:hover {
  color: #000;
}

:deep(.btn-primary),
:deep(.create-group-submit-btn) {
  background-color: #2196F3 !important;
  color: white !important;
}

:deep(.btn-primary:hover),
:deep(.create-group-submit-btn:hover) {
  background-color: #1976D2 !important;
}
</style> 