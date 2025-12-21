<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-left-content">
          <div class="brand">
            <img src="@/assets/icon.png" alt="BusinessUnion" class="brand-logo" />
            <span class="brand-name">BusinessUnion</span>
          </div>
          <h1>Новый пароль</h1>
          <p class="auth-subtitle">Придумайте надёжный пароль для вашего аккаунта</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <div v-if="success" class="success-card">
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Пароль изменён!</h2>
            <p>Теперь вы можете войти с новым паролем</p>
            <router-link to="/login" class="btn-primary">Войти в систему</router-link>
          </div>

          <template v-else>
            <div class="auth-header">
              <h2>Создание нового пароля</h2>
              <p>Введите новый пароль для вашего аккаунта</p>
            </div>

            <form @submit.prevent="resetPassword" class="auth-form">
              <div class="form-group">
                <label for="password">Новый пароль</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="password" 
                    v-model="password" 
                    required 
                    placeholder="Минимум 6 символов"
                    minlength="6"
                  />
                  <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                    <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Подтвердите пароль</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    id="confirmPassword" 
                    v-model="confirmPassword" 
                    required 
                    placeholder="Повторите пароль"
                  />
                  <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                    <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="error" class="error-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ error }}
              </div>

              <button type="submit" class="btn-submit" :disabled="isLoading">
                <span v-if="!isLoading">Сохранить пароль</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </form>
          </template>

          <router-link to="/login" class="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Вернуться к входу
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      confirmPassword: '',
      error: '',
      isLoading: false,
      success: false,
      showPassword: false,
      showConfirmPassword: false
    };
  },
  mounted() {
    if (!this.$route.query.token) {
      this.error = 'Токен сброса пароля не найден';
    }
  },
  methods: {
    async resetPassword() {
      this.error = '';
      
      if (this.password.length < 6) {
        this.error = 'Пароль должен содержать минимум 6 символов';
        return;
      }
      
      if (this.password !== this.confirmPassword) {
        this.error = 'Пароли не совпадают';
        return;
      }

      this.isLoading = true;
      
      try {
        await axios.post('/api/auth/reset-password', {
          token: this.$route.query.token,
          password: this.password
        });
        this.success = true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Не удалось сбросить пароль. Возможно, ссылка устарела.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f8fafc;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.auth-left {
  background: linear-gradient(135deg, #1E6BFF 0%, #0d4ed3 100%);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.auth-left-content {
  max-width: 400px;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.auth-left-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.auth-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.auth-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}

.auth-header p {
  color: #64748b;
  margin: 0;
}

.success-card {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #16a34a;
}

.success-card h2 {
  color: #1a1a2e;
  margin: 0 0 0.75rem;
}

.success-card p {
  color: #64748b;
  margin: 0 0 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
}

input {
  width: 100%;
  padding: 0.875rem 2.75rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1a1a2e;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #1E6BFF;
  box-shadow: 0 0 0 4px rgba(30, 107, 255, 0.1);
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
}

.toggle-password:hover {
  color: #1E6BFF;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.875rem;
}

.btn-submit, .btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem;
  background: #1E6BFF;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  min-height: 50px;
}

.btn-submit:hover:not(:disabled), .btn-primary:hover {
  background: #1557d4;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 2rem;
}

.back-link:hover {
  color: #1E6BFF;
}

@media (max-width: 968px) {
  .auth-container {
    grid-template-columns: 1fr;
  }
  .auth-left {
    display: none;
  }
}
</style>
