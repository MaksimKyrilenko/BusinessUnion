<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="user-info" v-if="user">
      <h2>Добро пожаловать, {{ user.firstName }}!</h2>
      <!-- Добавьте здесь содержимое дашборда -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  data() {
    return {
      user: null
    }
  },
  async created() {
    // Здесь можно загрузить данные пользователя
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Добавьте запрос к API для получения данных пользователя
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.user-info {
  margin-top: 20px;
}
</style> 