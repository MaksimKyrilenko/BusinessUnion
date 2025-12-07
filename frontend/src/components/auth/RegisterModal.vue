<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <div class="register-header">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1E6BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#1E6BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#1E6BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Создать аккаунт</h2>
        <p class="subtitle">Присоединяйтесь к BusinessUnion</p>
      </div>

      <div v-if="error" class="error-message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Имя</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" id="firstName" v-model="firstName" required placeholder="Иван" />
            </div>
          </div>
          <div class="form-group">
            <label for="lastName">Фамилия</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" id="lastName" v-model="lastName" required placeholder="Иванов" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="middleName">Отчество <span class="optional">(необязательно)</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input type="text" id="middleName" v-model="middleName" placeholder="Иванович" />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input type="email" id="email" v-model="email" required placeholder="example@mail.com" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required placeholder="Мин. 6 символов" />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Подтверждение</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input :type="showPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword" required placeholder="Повторите" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="userType">Тип пользователя</label>
          <div class="input-wrapper select-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <select id="userType" v-model="userType" required>
              <option value="">Выберите тип</option>
              <option value="startup_founder">Стартапер</option>
              <option value="investor">Инвестор</option>
              <option value="businessman">Бизнесмен</option>
              <option value="crypto_trader">Крипто-трейдер</option>
            </select>
            <svg class="select-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <div class="consent-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="agreeToTerms" required />
            <span class="checkmark"></span>
            <span class="consent-text">
              Я соглашаюсь с 
              <a href="/terms" target="_blank">Пользовательским соглашением</a>, 
              <a href="/privacy" target="_blank">Политикой конфиденциальности</a> и 
              <a href="/data-processing" target="_blank">Обработкой персональных данных</a>
            </span>
          </label>
        </div>

        <button type="submit" class="btn-register" :disabled="isLoading || !agreeToTerms">
          <span v-if="!isLoading">Зарегистрироваться</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user';

export default {
  name: 'RegisterModal',
  emits: ['close', 'success'],
  setup() {
    const userStore = useUserStore();
    return { userStore };
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
      agreeToTerms: false,
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    async handleRegister() {
      if (!this.agreeToTerms) {
        this.error = 'Необходимо принять условия использования';
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Пароли не совпадают';
        return;
      }

      if (this.password.length < 6) {
        this.error = 'Пароль должен содержать минимум 6 символов';
        return;
      }

      this.isLoading = true;
      this.error = '';

      try {
        const result = await this.userStore.register({
          firstName: this.firstName,
          lastName: this.lastName,
          middleName: this.middleName,
          email: this.email,
          password: this.password,
          userType: this.userType
        });

        if (result.success) {
          await this.userStore.loadUser();
          this.$emit('success');
          this.$emit('close');
        } else {
          this.error = result.message || 'Ошибка при регистрации';
        }
      } catch (error) {
        this.error = 'Произошла ошибка при регистрации';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  width: 95%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.modal-close:hover {
  color: #1E6BFF;
  background: rgba(30, 107, 255, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: rgba(30, 107, 255, 0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
}

h2 {
  color: #1a1a2e;
  margin: 0 0 0.35rem;
  font-size: 1.4rem;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  color: #374151;
  font-size: 0.8rem;
  font-weight: 600;
}

.optional {
  color: #9ca3af;
  font-weight: 400;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

input, select {
  width: 100%;
  padding: 0.7rem 0.875rem 0.7rem 2.5rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #1a1a2e;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #1E6BFF;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30, 107, 255, 0.1);
}

input::placeholder {
  color: #9ca3af;
}

.select-wrapper select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.25rem;
}

.select-arrow {
  position: absolute;
  right: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #1E6BFF;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.consent-group {
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
  position: relative;
  padding-left: 28px;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  top: 1px;
  height: 18px;
  width: 18px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.checkbox-label:hover .checkmark {
  border-color: #1E6BFF;
}

.checkbox-label input:checked ~ .checkmark {
  background: #1E6BFF;
  border-color: #1E6BFF;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.consent-text {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.5;
}

.consent-text a {
  color: #1E6BFF;
  text-decoration: none;
  font-weight: 500;
}

.consent-text a:hover {
  text-decoration: underline;
}

.btn-register {
  width: 100%;
  padding: 0.8rem;
  background: #1E6BFF;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-register:hover:not(:disabled) {
  background: #1557d4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 107, 255, 0.3);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
}
</style>