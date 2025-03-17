<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Регистрация</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <form @submit.prevent="handleRegister" class="register-form">
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
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Повторите пароль"
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

        <div class="form-group">
          <label for="interests">Интересы</label>
          <textarea
            id="interests"
            v-model="interests"
            placeholder="Опишите ваши интересы и опыт"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" class="btn-register">Зарегистрироваться</button>
      </form>

      <div class="register-footer">
        <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
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
      error: null
    }
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Пароли не совпадают';
        return;
      }

      try {
        // Очищаем предыдущие данные
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
          // Сохраняем данные пользователя
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('userType', response.user.userType);
          
          // Добавляем небольшую задержку перед редиректом
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 100);
        } else {
          throw new Error('Отсутствуют необходимые данные в ответе');
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        if (error.response?.status === 409) {
          this.error = 'Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в существующий аккаунт.';
        } else {
          this.error = error.response?.data?.message || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.';
        }
        
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.register-form {
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

input, select, textarea {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.btn-register {
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

.btn-register:hover {
  background-color: #218838;
}

.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.register-footer a {
  color: #28a745;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}

.error {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
}
</style> 