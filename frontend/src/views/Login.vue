<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Вход в систему</h2>
      <form @submit.prevent="handleLogin" class="login-form">
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

        <div class="form-group">
          <label for="userType">Тип пользователя</label>
          <select id="userType" v-model="userType" required>
            <option value="">Выберите тип пользователя</option>
            <option value="startup_founder">Стартапер</option>
            <option value="investor">Инвестор</option>
            <option value="businessman">Бизнесмен</option>
            <option value="crypto_trader">Крипто-трейдер</option>
          </select>
        </div>

        <button type="submit" class="btn-login">Войти</button>
      </form>

      <div class="login-footer">
        <p>Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      userType: '',
      error: null
    }
  },
  created() {
    // Проверяем, есть ли уже токен
    const token = localStorage.getItem('token');
    if (token) {
      this.$router.push('/dashboard');
    }
  },
  methods: {
    async handleLogin() {
      try {
        // Очищаем предыдущие данные
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        
        const response = await api.post('/auth/login', {
          email: this.email,
          password: this.password,
          userType: this.userType
        });

        if (response.data.token && response.data.user) {
          const { token, user } = response.data;
          
          // Проверяем валидность данных перед сохранением
          if (!token || !user || !user.id || !user.userType) {
            throw new Error('Некорректные данные пользователя');
          }

          localStorage.setItem('token', token);
          localStorage.setItem('userType', user.userType);
          localStorage.setItem('userId', user.id);

          // Добавляем небольшую задержку перед редиректом
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 100);
        } else {
          throw new Error('Отсутствуют необходимые данные в ответе');
        }
      } catch (error) {
        console.error('Ошибка при входе:', error);
        this.error = error.response?.data?.message || 'Ошибка при входе в систему';
        
        // Очищаем данные в случае ошибки
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #2c3e50;
  font-weight: 500;
}

input, select {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.btn-login {
  background-color: #28a745;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-login:hover {
  background-color: #218838;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.login-footer a {
  color: #28a745;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style> 