<template>
  <div class="input-group">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="input-wrapper">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="base-input"
        :class="{ 
          'has-error': error,
          'is-disabled': disabled
        }"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      
      <div v-if="icon" class="input-icon">
        <i :class="icon"></i>
      </div>
    </div>
    
    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-if="hint" class="hint-message">{{ hint }}</span>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default() {
        return `input-${Math.random().toString(36).substr(2, 9)}`
      }
    }
  }
}
</script>

<style scoped>
.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: var(--error-color);
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
}

.base-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.base-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.25);
}

.base-input.has-error {
  border-color: var(--error-color);
}

.base-input.is-disabled {
  background-color: var(--disabled-bg);
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--error-color);
}

.hint-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style> 