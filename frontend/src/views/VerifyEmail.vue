<template>
  <div class="auth-page">
    <div class="verify-container">
      <div class="verify-card">
        <div class="brand">
          <img src="@/assets/icon.png" alt="BusinessUnion" class="brand-logo" />
          <span class="brand-name">BusinessUnion</span>
        </div>

        <div v-if="loading" class="verify-status">
          <div class="loading-spinner large"></div>
          <h2>Подтверждение email...</h2>
          <p>Пожалуйста, подождите</p>
        </div>

        <div v-else-if="success" class="verify-status success">
          <div class="status-icon success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>Email подтверждён!</h2>
          <p>Ваш email успешно подтверждён. Теперь вы можете пользоваться всеми функциями платформы.</p>
          <router-link to="/profile" class="btn-primary">Перейти в профиль</router-link>
        </div>

        <div v-else class="verify-status error">
          <div class="status-icon error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2>Ошибка подтверждения</h2>
          <p>{{ error }}</p>
          <button @click="resendVerification" class="btn-secondary" :disabled="resending">
            {{ resending ? 'Отправка...' : 'Отправить письмо повторно' }}
          </button>
          <router-link to="/login" class="back-link">Вернуться к входу</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'VerifyEmail',
  data() {
    return {
      loading: true,
      success: false,
      error: '',
      resending: false
    };
  },
  async mounted() {
    const token = this.$route.query.token;
    if (!token) {
      this.loading = false;
      this.error = 'Токен верификации не найден';
      return;
    }
    await this.verifyEmail(token);
  },
  methods: {
    async verifyEmail(token) {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        this.success = true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Не удалось подтвердить email. Возможно, ссылка устарела.';
      } finally {
        this.loading = false;
      }
    },
    async resendVerification() {
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        this.error = 'Email не найден. Пожалуйста, войдите в систему.';
        return;
      }
      this.resending = true;
      try {
        await api.post('/auth/resend-verification', { email });
        alert('Письмо отправлено! Проверьте вашу почту.');
      } catch (err) {
        this.error = err.response?.data?.message || 'Не удалось отправить письмо';
      } finally {
        this.resending = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.verify-container {
  width: 100%;
  max-width: 480px;
}

.verify-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
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
  color: #1a1a2e;
}

.verify-status h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 1.5rem 0 0.75rem;
}

.verify-status p {
  color: #64748b;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.status-icon.success {
  background: #dcfce7;
  color: #16a34a;
}

.status-icon.error {
  background: #fef2f2;
  color: #dc2626;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #1E6BFF;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-primary {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: #1E6BFF;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1557d4;
  transform: translateY(-1px);
}

.btn-secondary {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: #f1f5f9;
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-link {
  display: block;
  margin-top: 1.5rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: #1E6BFF;
}
</style>
