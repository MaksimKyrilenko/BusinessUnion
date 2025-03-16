<template>
  <div class="login-container">
    <h2>Вход</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="credentials.email" required />
      </div>
      <div>
        <label for="password">Пароль:</label>
        <input type="password" v-model="credentials.password" required />
      </div>
      <button type="submit">Войти</button>
    </form>
    <p v-if="message">{{ message }}</p>
    
    <div class="register-link">
      <p>Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import api from '@/axios';

export default defineComponent({
  name: 'LoginForm',
  data() {
    return {
      credentials: {
        email: '',
        password: '',
      },
      message: '',
    };
  },
  methods: {
    async login() {
      console.log('Начало метода login');
      console.log('Данные для входа:', this.credentials);

      try {
        console.log('Отправка запроса на сервер...');
        const response = await api.post('/users/login', this.credentials);
        console.log('Ответ сервера:', response);

        this.message = 'Вход выполнен успешно!';
        console.log('Токен получен:', response.data.access_token);

        localStorage.setItem('token', response.data.access_token);
        console.log('Токен сохранен в localStorage');

        this.$router.push('/dashboard');
        console.log('Перенаправление на /dashboard');
      } catch (error) {
        console.error('Ошибка при входе:', error);
        this.message = 'Ошибка при входе: ' + (error.response?.data?.message || error.message);
      }
    },
  },
});
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

p {
  color: red;
  text-align: center;
}

.register-link {
  margin-top: 1rem;
  text-align: center;
}

.register-link a {
  color: #2c3e50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>