<template>
  <div class="dashboard-content">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Мои проекты</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeProjects }}</span>
            <span class="stat-label">Активные</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.pendingProjects }}</span>
            <span class="stat-label">На рассмотрении</span>
          </div>
        </div>
        <BaseButton @click="$router.push('/projects/new')">
          Создать проект
        </BaseButton>
      </div>

      <div class="dashboard-card">
        <h3>Инвестиции</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatMoney(stats.totalInvestments) }}</span>
            <span class="stat-label">Всего привлечено</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeInvestors }}</span>
            <span class="stat-label">Активных инвесторов</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Последние сообщения</h3>
        <div class="messages-preview">
          <div v-for="message in recentMessages" :key="message.id" class="message-item">
            <img :src="message.avatar" :alt="message.sender" class="message-avatar">
            <div class="message-content">
              <strong>{{ message.sender }}</strong>
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>
        <BaseButton 
          variant="secondary"
          @click="$router.push('/messages')"
        >
          Все сообщения
        </BaseButton>
      </div>
    </div>

    <div class="recent-activities">
      <h3>Последние активности</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" 
             :key="activity.id" 
             class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            {{ getActivityIcon(activity.type) }}
          </div>
          <div class="activity-details">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ formatTime(activity.time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/axios'

export default {
  name: 'BusinessmanDashboard',
  components: {
    BaseButton
  },
  data() {
    return {
      stats: {
        activeProjects: 0,
        pendingProjects: 0,
        totalInvestments: 0,
        activeInvestors: 0
      },
      recentMessages: [],
      recentActivities: []
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    formatTime(time) {
      return format(new Date(time), 'dd MMM, HH:mm', { locale: ru })
    },
    getActivityIcon(type) {
      const icons = {
        project: '📋',
        investment: '💰',
        message: '💬',
        update: '🔄'
      }
      return icons[type] || '📌'
    },
    async loadDashboardData() {
      try {
        const [statsResponse, messagesResponse, activitiesResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-messages'),
          api.get('/dashboard/activities')
        ])
        
        this.stats = statsResponse.data
        this.recentMessages = messagesResponse.data
        this.recentActivities = activitiesResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке данных дашборда:', error)
      }
    }
  },
  created() {
    this.loadDashboardData()
  }
}
</script>

<style scoped>
.dashboard-content {
  padding: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard-card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #28a745;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.messages-preview {
  margin-bottom: 15px;
}

.message-item {
  display: flex;
  align-items: start;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  flex: 1;
}

.message-content p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.activity-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activity-item {
  display: flex;
  align-items: start;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
}

.activity-details {
  flex: 1;
}

.activity-text {
  margin: 0;
  color: #2c3e50;
}

.activity-time {
  font-size: 12px;
  color: #666;
}
</style> 