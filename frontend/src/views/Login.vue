<template>
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

        <button type="submit" class="btn-login" :disabled="isLoading">Войти</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'Login',
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
  created() {
    if (this.userStore.isAuthenticated) {
      this.$router.push('/dashboard')
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
      
      console.log('Отправка запроса на вход с email:', this.email);
      
      try {
        // Вызываем метод login только с email и паролем
        const result = await this.userStore.login(this.email, this.password);
        
        if (result.success) {
          console.log('Вход выполнен успешно, перенаправление на дашборд');
          await this.userStore.loadUser();
          this.$emit('success');
        } else {
          this.error = result.message || 'Ошибка при входе';
          console.error('Ошибка входа:', this.error);
        }
      } catch (error) {
        console.error('Непредвиденная ошибка при входе:', error);
        this.error = 'Произошла ошибка при входе в систему';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.login-card {
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
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

input, select {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #333333;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
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

.btn-login:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.btn-login:active {
  transform: translateY(0);
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #666666;
  font-size: 0.95rem;
}

.login-footer a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: #1976D2;
  text-decoration: underline;
}

.error-message {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
</style> 