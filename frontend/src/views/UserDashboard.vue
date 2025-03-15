<template>
  <div>
    <h2>Добро пожаловать в панель управления</h2>
    <p>Вы успешно вошли в систему.</p>
    <button @click="logout">Выйти</button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login'); // Перенаправление на страницу входа
    },
  },
};
</script>
