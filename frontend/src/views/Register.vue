<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-left-content">
          <div class="brand">
            <img src="@/assets/icon.png" alt="BusinessUnion" class="brand-logo" />
            <span class="brand-name">BusinessUnion</span>
          </div>
          <h1>Присоединяйтесь к нам!</h1>
          <p class="auth-subtitle">Создайте аккаунт и получите доступ к лучшей платформе для бизнеса и инвестиций</p>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Бесплатная регистрация</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <span>Каталог стартапов</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span>Аналитика и инструменты</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <div class="auth-header">
            <h2>Регистрация</h2>
            <p>Создайте свой аккаунт</p>
          </div>

          <div v-if="error" class="error-message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
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

            <div class="form-group">
              <label for="interests">Интересы <span class="optional">(необязательно)</span></label>
              <textarea id="interests" v-model="interests" placeholder="Опишите ваши интересы и опыт" rows="2"></textarea>
            </div>

            <div class="consent-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agreeToTerms" required />
                <span class="checkmark"></span>
                <span class="consent-text">
                  Я соглашаюсь с 
                  <router-link to="/terms" target="_blank">Пользовательским соглашением</router-link>, 
                  <router-link to="/privacy" target="_blank">Политикой конфиденциальности</router-link> и 
                  <router-link to="/data-processing" target="_blank">Обработкой персональных данных</router-link>
                </span>
              </label>
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading || !agreeToTerms">
              <span v-if="!isLoading">Зарегистрироваться</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
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
import authService from '@/services/auth.service';

export default {
  name: 'Register',
  data() {
    return {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: '',
      interests: '',
      agreeToTerms: false,
      error: null,
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
      this.error = null;

      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');

        const response = await authService.register({
          firstName: this.firstName,
          lastName: this.lastName,
          middleName: this.middleName,
          email: this.email,
          password: this.password,
          userType: this.userType,
          interests: this.interests
        });
        
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('userType', response.user.userType);
          this.$router.push('/dashboard');
        } else {
          throw new Error('Отсутствуют необходимые данные в ответе');
        }
      } catch (error) {
        if (error.response?.status === 409) {
          this.error = 'Пользователь с таким email уже существует';
        } else {
          this.error = error.response?.data?.message || error.message || 'Произошла ошибка при регистрации';
        }
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
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
  padding: 2rem;
  overflow-y: auto;
}

.auth-form-container {
  width: 100%;
  max-width: 480px;
}

.auth-header {
  margin-bottom: 1.5rem;
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
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  color: #374151;
  font-size: 0.85rem;
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

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #1a1a2e;
  transition: all 0.2s ease;
}

textarea {
  padding: 0.75rem 1rem;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #1E6BFF;
  box-shadow: 0 0 0 3px rgba(30, 107, 255, 0.1);
}

input::placeholder, textarea::placeholder {
  color: #9ca3af;
}

.select-wrapper select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.5rem;
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
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
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
  background: #fff;
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
  font-size: 0.8rem;
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

.btn-submit {
  width: 100%;
  padding: 0.8rem;
  background: #1E6BFF;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  min-height: 48px;
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
  opacity: 0.6;
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
  margin-top: 1.5rem;
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
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>