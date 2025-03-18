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
          
          this.$emit('success');
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
  width: 100%;
  margin: 0;
  padding: 0;
}

.register-card {
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  width: 100%;
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

input, select, textarea {
  background: rgba(25, 25, 25, 0.9);
  border: 1px solid rgba(33, 150, 243, 0.2);
  color: #ffffff;
  transition: all 0.3s ease;
  padding: 1rem 1.2rem;
  border-radius: 0.8rem;
  font-size: 1.1rem;
  width: 100%;
}

textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

label {
  color: #b3b3b3;
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.btn-register {
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

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(33, 150, 243, 0.3);
}

.btn-register:active {
  transform: translateY(1px);
}

.register-footer {
  margin-top: 2rem;
  color: #b3b3b3;
  text-align: center;
  font-size: 1.1rem;
}

.register-footer a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-footer a:hover {
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

/* Анимация для полей формы */
@keyframes formFieldAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  animation: formFieldAppear 0.3s ease-out forwards;
}

.form-group:nth-child(1) { animation-delay: 0.1s; }
.form-group:nth-child(2) { animation-delay: 0.2s; }
.form-group:nth-child(3) { animation-delay: 0.3s; }
.form-group:nth-child(4) { animation-delay: 0.4s; }
.form-group:nth-child(5) { animation-delay: 0.5s; }
.form-group:nth-child(6) { animation-delay: 0.6s; }
.form-group:nth-child(7) { animation-delay: 0.7s; }
.form-group:nth-child(8) { animation-delay: 0.8s; }
</style> 