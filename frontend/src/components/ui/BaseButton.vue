<template>
  <button
    :type="type"
    class="base-button"
    :class="[
      variant,
      size,
      { 'is-loading': loading }
    ]"
    :disabled="loading"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loader"></span>
    <span class="button-content" :class="{ 'is-hidden': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'button'
    },
    variant: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'medium'
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.base-button {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: var(--primary-color);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  position: relative;
}

.base-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.base-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.is-loading {
  color: transparent;
}

.loader {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.button-content.is-hidden {
  visibility: hidden;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Variants */
.base-button.secondary {
  background-color: #6c757d;
  color: white;
}

.base-button.secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.base-button.danger {
  background-color: #dc3545;
  color: white;
}

.base-button.danger:hover:not(:disabled) {
  background-color: #c82333;
}

/* Sizes */
.base-button.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.base-button.large {
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
}
</style> 