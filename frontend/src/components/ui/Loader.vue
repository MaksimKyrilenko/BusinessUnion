<template>
  <div v-if="isLoading" class="loader-wrapper">
    <div class="loader">
      <div class="spinner"></div>
      <div v-if="text" class="loader-text">{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid var(--border-color);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loader-text {
  margin-top: 1rem;
  color: var(--text-color);
  font-size: 0.875rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 