<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-left-content">
          <div class="brand">
            <img src="@/assets/icon.png" alt="BusinessUnion" class="brand-logo" />
            <span class="brand-name">BusinessUnion</span>
          </div>
          <h1>Восстановление пароля</h1>
          <p class="auth-subtitle">Введите email, указанный при регистрации, и мы отправим вам инструкции по сбросу пароля</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <div class="auth-header">
            <h2>Забыли пароль?</h2>
            <p>Не переживайте, мы поможем восстановить доступ</p>
          </div>

          <div v-if="sent" class="success-message">
            <div class="success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Письмо отправлено!</h3>
            <p>Проверьте вашу почту <strong>{{ email }}</strong> и следуйте инструкциям в письме.</p>
            <p class="hint">Не получили письмо? Проверьте папку "Спам" или попробуйте отправить повторно.</p>
            <button @click="resetForm" class="btn-secondary">Отправить повторно</button>
          </div>

          <form v-else @submit.prevent="sendResetEmail" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" id="email" v-model="email" required placeholder="example@mail.com" />
              </div>
            </div>

            <div v-if="error" class="error-message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="!isLoading">Отправить инструкции</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Вспомнили пароль? <router-link to="/login">Войти</router-link></p>
          </div>

          <router-link to="/" class="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            На главную
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      error: '',
      isLoading: false,
      sent: false
    };
  },
  methods: {
    async sendResetEmail() {
      this.isLoading = true;
      this.error = '';
      
      try {
        await axios.post('/api/auth/forgot-password', { email: this.email });
        this.sent = true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Произошла ошибка. Попробуйте позже.';
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.sent = false;
      this.error = '';
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
  line-height: 1.6;
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
  padding: 0.875rem 1rem 0.875rem 2.75rem;
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

.success-message {
  text-align: center;
  padding: 2rem;
  background: #f0fdf4;
  border-radius: 16px;
  border: 1px solid #bbf7d0;
}

.success-icon {
  width: 56px;
  height: 56px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #16a34a;
}

.success-message h3 {
  color: #166534;
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}

.success-message p {
  color: #15803d;
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}

.success-message .hint {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.875rem;
  background: #1E6BFF;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit:hover:not(:disabled) {
  background: #1557d4;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #1E6BFF;
  color: #1E6BFF;
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

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #64748b;
  margin: 0;
}

.auth-footer a {
  color: #1E6BFF;
  text-decoration: none;
  font-weight: 600;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 2rem;
  transition: color 0.2s;
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
