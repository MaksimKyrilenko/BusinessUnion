<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-left-content">
          <div class="brand">
            <img src="@/assets/icon.png" alt="BusinessUnion" class="brand-logo" />
            <span class="brand-name">BusinessUnion</span>
          </div>
          <h1>С возвращением!</h1>
          <p class="auth-subtitle">Войдите в свой аккаунт, чтобы продолжить работу с платформой</p>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Безопасный вход</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span>5000+ пользователей</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span>₽100M+ инвестиций</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <div class="auth-header">
            <h2>Вход в систему</h2>
            <p>Введите данные для входа</p>
          </div>

          <form @submit.prevent="login" class="auth-form">
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
            
            <div class="form-group">
              <label for="password">Пароль</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required placeholder="Введите пароль" />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
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

            <div class="form-options">
              <router-link to="/forgot-password" class="forgot-link">Забыли пароль?</router-link>
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="!isLoading">Войти</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
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
import { useUserStore } from '@/stores/user';

export default {
  name: 'Login',
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  created() {
    if (this.userStore.isAuthenticated) {
      this.$router.push('/dashboard');
    }
  },
  methods: {
    async login() {
      this.isLoading = true;
      this.error = '';
      
      if (!this.email || !this.password) {
        this.error = 'Пожалуйста, заполните все поля';
        this.isLoading = false;
        return;
      }
      
      try {
        const result = await this.userStore.login(this.email, this.password);
        
        if (result.success) {
          await this.userStore.loadUser();
          this.$router.push('/dashboard');
        } else {
          this.error = result.message || 'Ошибка при входе';
        }
      } catch (error) {
        this.error = 'Произошла ошибка при входе в систему';
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
  line-height: 1.2;
}

.auth-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0 0 3rem;
  line-height: 1.6;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
}

.feature-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 0.95rem;
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
  pointer-events: none;
}

input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1a1a2e;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #1E6BFF;
  box-shadow: 0 0 0 4px rgba(30, 107, 255, 0.1);
}

input::placeholder {
  color: #9ca3af;
}

.toggle-password {
  position: absolute;
  right: 14px;
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
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.875rem;
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
  transition: all 0.2s ease;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit:hover:not(:disabled) {
  background: #1557d4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 107, 255, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  color: #1E6BFF;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
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
  font-size: 0.95rem;
}

.auth-footer a {
  color: #1E6BFF;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
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
  
  .auth-right {
    padding: 2rem;
  }
}
</style>