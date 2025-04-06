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

        console.log('Ответ от сервиса регистрации:', response);
        
        if (response.token && response.user) {
          console.log('Успешная регистрация, данные получены:', {
            hasToken: !!response.token,
            userId: response.user.id,
            userType: response.user.userType
          });
          
          // Сохраняем данные пользователя, хотя они уже должны быть сохранены в auth.service
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('userType', response.user.userType);
          
          // Перенаправляем на дашборд
          this.$router.push('/dashboard');
        } else {
          console.error('Отсутствуют ожидаемые данные в ответе:', response);
          throw new Error('Отсутствуют необходимые данные в ответе');
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        if (error.response?.status === 409) {
          this.error = 'Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в существующий аккаунт.';
        } else {
          this.error = error.response?.data?.message || error.message || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.';
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

input, select, textarea {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #333333;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 100%;
}

textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  border-color: #2196F3;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

input::placeholder, textarea::placeholder {
  color: #999999;
}

label {
  color: #333333;
  font-size: 0.95rem;
  font-weight: 500;
  margin-left: 0.25rem;
}

.btn-register {
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

.btn-register:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.btn-register:active {
  transform: translateY(0);
}

.register-footer {
  margin-top: 1.5rem;
  color: #666666;
  text-align: center;
  font-size: 0.95rem;
}

.register-footer a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-footer a:hover {
  color: #1976D2;
  text-decoration: underline;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(244, 67, 54, 0.2);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message::before {
  content: '⚠';
  font-size: 1.1rem;
}

/* Анимация для полей формы */
@keyframes formFieldAppear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  animation: formFieldAppear 0.3s ease-out forwards;
}

.form-group:nth-child(1) { animation-delay: 0.05s; }
.form-group:nth-child(2) { animation-delay: 0.1s; }
.form-group:nth-child(3) { animation-delay: 0.15s; }
.form-group:nth-child(4) { animation-delay: 0.2s; }
.form-group:nth-child(5) { animation-delay: 0.25s; }
.form-group:nth-child(6) { animation-delay: 0.3s; }
.form-group:nth-child(7) { animation-delay: 0.35s; }
.form-group:nth-child(8) { animation-delay: 0.4s; }
</style> 