<template>
  <div class="select-group">
    <label v-if="label" :for="id" class="select-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="select-wrapper">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="base-select"
        :class="{ 
          'has-error': error,
          'is-disabled': disabled
        }"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" disabled selected>
          {{ placeholder }}
        </option>
        <option 
          v-for="option in options" 
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <div class="select-arrow">
        <i class="fas fa-chevron-down"></i>
      </div>
    </div>
    
    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-if="hint" class="hint-message">{{ hint }}</span>
  </div>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      required: true,
      validator: (options) => {
        return options.every(option => 
          option.hasOwnProperty('value') && 
          option.hasOwnProperty('label')
        )
      }
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Выберите значение'
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
    id: {
      type: String,
      default() {
        return `select-${Math.random().toString(36).substr(2, 9)}`
      }
    }
  }
}
</script>

<style scoped>
.select-group {
  margin-bottom: 1rem;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: var(--error-color);
  margin-left: 4px;
}

.select-wrapper {
  position: relative;
}

.base-select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.base-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.25);
}

.base-select.has-error {
  border-color: var(--error-color);
}

.base-select.is-disabled {
  background-color: var(--disabled-bg);
  cursor: not-allowed;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
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