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

          this.$emit('success');
          this.$router.push('/dashboard');
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
  gap: 1.8rem;
}

h2 {
  color: #2196F3;
  margin-bottom: 2.5rem;
  font-family: 'Raleway', sans-serif;
  font-size: 2.5rem;
  text-align: center;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #2196F3, #64B5F6);
  border-radius: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

label {
  color: #b3b3b3;
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

input, select {
  background: rgba(25, 25, 25, 0.9);
  border: 1px solid rgba(33, 150, 243, 0.2);
  color: #ffffff;
  transition: all 0.3s ease;
  padding: 1rem 1.2rem;
  border-radius: 0.8rem;
  font-size: 1.1rem;
  width: 100%;
}

input:focus, select:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn-login {
  background: linear-gradient(45deg, #2196F3, #64B5F6);
  border: none;
  border-radius: 0.8rem;
  color: white;
  padding: 1.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(33, 150, 243, 0.3);
}

.btn-login:active {
  transform: translateY(1px);
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #b3b3b3;
  font-size: 1.1rem;
}

.login-footer a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: #64B5F6;
  text-decoration: underline;
}

.error-message {
  background: rgba(220, 53, 69, 0.1);
  color: #ff6b6b;
  padding: 1rem 1.2rem;
  border-radius: 0.8rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(220, 53, 69, 0.2);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message::before {
  content: '⚠';
  font-size: 1.2rem;
}
</style> 