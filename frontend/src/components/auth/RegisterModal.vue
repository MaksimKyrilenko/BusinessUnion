<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">&times;</button>
      <div class="register-container">
        <div class="register-card">
          <h2>Регистрация</h2>
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Имя</label>
                <input
                  type="text"
                  id="firstName"
                  v-model="firstName"
                  required
                  placeholder="Введите ваше имя"
                />
              </div>

              <div class="form-group">
                <label for="lastName">Фамилия</label>
                <input
                  type="text"
                  id="lastName"
                  v-model="lastName"
                  required
                  placeholder="Введите вашу фамилию"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="middleName">Отчество</label>
              <input
                type="text"
                id="middleName"
                v-model="middleName"
                placeholder="Введите ваше отчество"
              />
            </div>

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

            <div class="form-row">
              <div class="form-group">
                <label for="password">Пароль</label>
                <input
                  type="password"
                  id="password"
                  v-model="password"
                  required
                  placeholder="Придумайте пароль"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Подтверждение</label>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  required
                  placeholder="Повторите пароль"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="userType">Тип пользователя</label>
              <select id="userType" v-model="userType" required>
                <option value="">Выберите тип пользователя</option>
                <option value="startup_founder">Стартап</option>
                <option value="investor">Инвестор</option>
                <option value="businessman">Бизнесмен</option>
                <option value="crypto_trader">Крипто-трейдер</option>
              </select>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button type="submit" class="btn-register" :disabled="isLoading">
              {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
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
  name: 'RegisterModal',
  emits: ['close', 'success'],
  setup() {
    const userStore = useUserStore()
    return {
      userStore
    }
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: '',
      error: '',
      isLoading: false
    }
  },
  methods: {
    async handleRegister() {
      this.isLoading = true
      this.error = ''

      if (this.password !== this.confirmPassword) {
        this.error = 'Пароли не совпадают'
        this.isLoading = false
        return
      }

      try {
        const result = await this.userStore.register({
          firstName: this.firstName,
          lastName: this.lastName,
          middleName: this.middleName,
          email: this.email,
          password: this.password,
          userType: this.userType
        })

        if (result.success) {
          await this.userStore.loadUser()
          this.$emit('success')
          this.$emit('close')
        } else {
          this.error = result.message || 'Ошибка при регистрации'
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error)
        this.error = 'Произошла ошибка при регистрации'
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
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 95%;
  max-width: 600px;
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

.register-container {
  width: 100%;
}

.register-card {
  width: 100%;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

h2 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-family: 'Raleway', sans-serif;
  font-size: 1.75rem;
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
  gap: 0.25rem;
}

label {
  color: #333333;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 0.25rem;
}

input, select {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #333333;
  transition: all 0.3s ease;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  width: 100%;
}

input:focus, select:focus {
  border-color: #2196F3;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

input::placeholder {
  color: #999999;
}

.btn-register {
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

.btn-register:hover:not(:disabled) {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.btn-register:disabled {
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