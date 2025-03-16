<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
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
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  min-width: 300px;
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
}

.modal-close:hover {
  color: #000;
}
</style> 