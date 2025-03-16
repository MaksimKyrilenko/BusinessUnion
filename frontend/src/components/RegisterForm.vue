<template>
  <div class="register-container">
    <h2>Регистрация</h2>
    <form @submit.prevent="register">
      <div>
        <label for="username">Имя пользователя:</label>
        <input type="text" v-model="user.username" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" required />
      </div>
      <div>
        <label for="password">Пароль:</label>
        <input type="password" v-model="user.password" required />
      </div>
      <button type="submit">Зарегистрироваться</button>
    </form>
    <p v-if="message">{{ message }}</p>
    
    <!-- Добавляем ссылку на логин -->
    <div class="login-link">
      <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterForm',
  data() {
    return {
      user: {
        username: '',
        email: '',
        password: '',
      },
      message: '',
    };
  },
  methods: {
    async register() {
      try {
        const response = await axios.post('/api/users/register', this.user);
        this.message = 'Регистрация успешна!';
        console.log('Регистрация успешна:', response.data);
        // Добавляем редирект на страницу логина после успешной регистрации
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      } catch (error) {
        this.message = 'Ошибка при регистрации';
        console.error('Ошибка:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

button {
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #218838;
}

p {
  text-align: center;
  margin-top: 10px;
}

p[v-if="message"] {
  color: #28a745;
  font-weight: 500;
}

.login-link {
  margin-top: 1rem;
  text-align: center;
}

.login-link a {
  color: #28a745;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>