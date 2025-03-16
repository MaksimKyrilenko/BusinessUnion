<template>
  <div class="dashboard">
    <h1>Добро пожаловать, {{ username }}!</h1>
    
    <!-- Секция для бизнесменов -->
    <section v-if="userType === 'businessman'" class="dashboard-section">
      <h2>Ваши бизнес-проекты</h2>
      <!-- Здесь будет компонент с проектами -->
    </section>

    <!-- Секция для инвесторов -->
    <section v-if="userType === 'investor'" class="dashboard-section">
      <h2>Инвестиционные возможности</h2>
      <!-- Здесь будет компонент с инвестициями -->
    </section>

    <!-- Секция для криптотрейдеров -->
    <section v-if="userType === 'crypto_trader'" class="dashboard-section">
      <h2>Крипто-аналитика</h2>
      <!-- Здесь будет компонент с крипто-данными -->
    </section>

    <!-- Секция для основателей стартапов -->
    <section v-if="userType === 'startup_founder'" class="dashboard-section">
      <h2>Ваши стартап-проекты</h2>
      <!-- Здесь будет компонент со стартапами -->
    </section>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      userType: '',
    }
  },
  async created() {
    try {
      // Здесь будет запрос к API для получения данных пользователя
      const response = await api.get('/users/profile');
      this.username = response.data.username;
      this.userType = response.data.userType;
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

h2 {
  color: #28a745;
  margin-bottom: 20px;
}
</style> 