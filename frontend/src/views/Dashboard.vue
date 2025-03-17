<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Добро пожаловать, {{ userInfo.firstName }}!</h1>
      <div class="user-type-badge">{{ userTypeLabel }}</div>
    </header>

    <div class="dashboard-content">
      <!-- Общие секции для всех пользователей -->
      <section class="news-section">
        <h2>Новости и события</h2>
        <div class="news-grid">
          <div v-for="news in newsItems" :key="news.id" class="news-card">
            <h3>{{ news.title }}</h3>
            <p>{{ news.description }}</p>
            <span class="news-date">{{ formatDate(news.date) }}</span>
          </div>
        </div>
      </section>

      <!-- Секции в зависимости от типа пользователя -->
      <template v-if="userType === 'startup_founder'">
        <section class="startup-section">
          <h2>Мои стартапы</h2>
          <div class="action-buttons">
            <router-link to="/startup/create" class="btn btn-primary">
              Создать новый стартап
            </router-link>
            <router-link to="/startup/my-startups" class="btn btn-secondary">
              Мои проекты
            </router-link>
            <router-link to="/startup/grants" class="btn btn-info">
              Гранты и субсидии
            </router-link>
          </div>
        </section>
      </template>

      <template v-if="userType === 'investor'">
        <section class="investor-section">
          <h2>Инвестиционные возможности</h2>
          <div class="action-buttons">
            <router-link to="/investor/catalog" class="btn btn-primary">
              Каталог стартапов
            </router-link>
            <router-link to="/investor/analysis" class="btn btn-secondary">
              Анализ проектов
            </router-link>
          </div>
        </section>
      </template>

      <template v-if="userType === 'businessman'">
        <section class="business-section">
          <h2>Аналитика рынка</h2>
          <div class="action-buttons">
            <router-link to="/businessman/analytics" class="btn btn-primary">
              Исследования и тренды
            </router-link>
          </div>
        </section>
      </template>

      <template v-if="userType === 'crypto_trader'">
        <section class="crypto-section">
          <h2>Крипто-аналитика</h2>
          <div class="action-buttons">
            <router-link to="/crypto/tracker" class="btn btn-primary">
              Крипто трекер
            </router-link>
          </div>
        </section>
      </template>

      <!-- Общие действия -->
      <section class="quick-actions">
        <h2>Быстрые действия</h2>
        <div class="action-buttons">
          <router-link to="/messenger" class="btn btn-outline">
            <i class="fas fa-comments"></i> Сообщения
          </router-link>
          <router-link to="/people" class="btn btn-outline">
            <i class="fas fa-users"></i> Поиск партнеров
          </router-link>
          <router-link to="/financial-analytics" class="btn btn-outline">
            <i class="fas fa-chart-line"></i> Финансовая аналитика
          </router-link>
          <router-link to="/profile" class="btn btn-outline">
            <i class="fas fa-user"></i> Профиль
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      userInfo: {
        firstName: '',
        lastName: '',
        userType: ''
      },
      newsItems: [],
      userType: ''
    }
  },
  computed: {
    userTypeLabel() {
      const types = {
        startup_founder: 'Стартапер',
        investor: 'Инвестор',
        businessman: 'Бизнесмен',
        crypto_trader: 'Крипто-трейдер'
      };
      return types[this.userType] || this.userType;
    }
  },
  async created() {
    try {
      // Получаем информацию о пользователе
      const response = await api.get('/users/profile');
      this.userInfo = response.data;
      this.userType = response.data.userType;

      // Получаем новости
      const newsResponse = await api.get('/news');
      this.newsItems = newsResponse.data;
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.user-type-badge {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
}

.dashboard-content {
  display: grid;
  gap: 2rem;
}

section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.news-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid #28a745;
}

.news-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.news-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #28a745;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-outline {
  border: 1px solid #28a745;
  color: #28a745;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quick-actions {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 