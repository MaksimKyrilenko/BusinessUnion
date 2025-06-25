<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">&times;</button>
      <div class="login-container">
        <div class="login-card">
          <h2>Вход в систему</h2>
          <form @submit.prevent="login" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                placeholder="Введите ваш email"
              />
            </div>
            
            <div class="form-group">
              <label for="password">Пароль</label>
              <input
                type="password"
                id="password"
                v-model="password"
                required
                placeholder="Введите ваш пароль"
              />
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button type="submit" class="btn-login" :disabled="isLoading">
              {{ isLoading ? 'Вход...' : 'Войти' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'LoginModal',
  emits: ['close', 'success'],
  setup() {
    const userStore = useUserStore()
    return {
      userStore
    }
  },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLoading: false
    }
  },
  methods: {
    async login() {
      this.isLoading = true
      this.error = ''
      
      if (!this.email || !this.password) {
        this.error = 'Пожалуйста, заполните все поля'
        this.isLoading = false
        return
      }
      
      try {
        const result = await this.userStore.login(this.email, this.password)
        
        if (result.success) {
          await this.userStore.loadUser()
          this.$emit('success')
          this.$emit('close')
        } else {
          this.error = result.message || 'Ошибка при входе'
        }
      } catch (error) {
        console.error('Ошибка при входе:', error)
        this.error = 'Произошла ошибка при входе в систему'
      } finally {
        this.isLoading = false
      }
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
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
}

.modal-close:hover {
  color: #334155;
  background: #f9fafb;
  transform: rotate(90deg);
}

.login-container {
  width: 100%;
}

.login-card {
  width: 100%;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  color: #2196F3;
  margin-bottom: 2rem;
  font-family: 'Raleway', sans-serif;
  font-size: 2rem;
  text-align: center;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, #2196F3, #64B5F6);
  border-radius: 2px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #333333;
  font-size: 0.95rem;
  font-weight: 500;
  margin-left: 0.25rem;
}

input {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #333333;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 100%;
}

input:focus {
  border-color: #2196F3;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

input::placeholder {
  color: #999999;
}

.btn-login {
  background: #2196F3;
  border: none;
  border-radius: 0.5rem;
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.btn-login:disabled {
  background: #90CAF9;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}
</style> 