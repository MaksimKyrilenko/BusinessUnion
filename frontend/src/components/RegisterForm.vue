<template>
  <div>
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
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
      } catch (error) {
        this.message = 'Ошибка при регистрации';
        console.error('Ошибка:', error.response?.data || error.message);
      }
    },
  },
};
</script>