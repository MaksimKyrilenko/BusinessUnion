<template>
  <div class="dashboard-content">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Мой стартап</h3>
        <div class="startup-info">
          <div class="startup-header">
            <h4>{{ startup.name }}</h4>
            <span :class="['status', startup.status]">{{ getStatusText(startup.status) }}</span>
          </div>
          <p class="description">{{ startup.description }}</p>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value">{{ formatMoney(startup.fundingGoal) }}</span>
              <span class="stat-label">Цель</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatMoney(startup.currentFunding) }}</span>
              <span class="stat-label">Привлечено</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ startup.investors }}</span>
              <span class="stat-label">Инвесторов</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Этапы развития</h3>
        <div class="milestones">
          <div v-for="milestone in milestones" 
               :key="milestone.id"
               :class="['milestone-item', { completed: milestone.completed }]"
          >
            <div class="milestone-status"></div>
            <div class="milestone-content">
              <h4>{{ milestone.title }}</h4>
              <p>{{ milestone.description }}</p>
              <span class="milestone-date">
                {{ milestone.completed ? 'Завершено: ' : 'Дедлайн: ' }}
                {{ formatDate(milestone.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Метрики</h3>
        <div class="metrics-grid">
          <div v-for="metric in metrics" 
               :key="metric.id"
               class="metric-item"
          >
            <div class="metric-header">
              <span class="metric-name">{{ metric.name }}</span>
              <span :class="['metric-change', metric.trend]">
                {{ metric.trend === 'up' ? '↑' : '↓' }} {{ metric.change }}%
              </span>
            </div>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-chart">
              <!-- Здесь будет мини-график -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Последние обновления</h3>
        <div class="updates-list">
          <div v-for="update in recentUpdates" 
               :key="update.id"
               class="update-item"
          >
            <div class="update-icon" :class="update.type">
              {{ getUpdateIcon(update.type) }}
            </div>
            <div class="update-content">
              <h4>{{ update.title }}</h4>
              <p>{{ update.description }}</p>
              <span class="update-time">{{ formatTime(update.time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Менторы и советники</h3>
        <div class="mentors-list">
          <div v-for="mentor in mentors" 
               :key="mentor.id"
               class="mentor-item"
          >
            <img :src="mentor.avatar" :alt="mentor.name" class="mentor-avatar">
            <div class="mentor-info">
              <h4>{{ mentor.name }}</h4>
              <p>{{ mentor.position }}</p>
              <div class="mentor-expertise">
                <span v-for="skill in mentor.expertise" 
                      :key="skill" 
                      class="expertise-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
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
  name: 'StartupFounderDashboard',
  components: {
    BaseButton
  },
  data() {
    return {
      startup: {
        name: '',
        status: '',
        description: '',
        fundingGoal: 0,
        currentFunding: 0,
        investors: 0
      },
      milestones: [],
      metrics: [],
      recentUpdates: [],
      mentors: []
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    formatDate(date) {
      return format(new Date(date), 'dd MMM yyyy', { locale: ru })
    },
    formatTime(time) {
      return format(new Date(time), 'dd MMM, HH:mm', { locale: ru })
    },
    getStatusText(status) {
      const statuses = {
        idea: 'Идея',
        mvp: 'MVP',
        launched: 'Запущен',
        scaling: 'Масштабирование'
      }
      return statuses[status] || status
    },
    getUpdateIcon(type) {
      const icons = {
        milestone: '🎯',
        funding: '💰',
        team: '👥',
        product: '🚀',
        market: '📊'
      }
      return icons[type] || '📌'
    },
    async loadDashboardData() {
      try {
        const [startupResponse, milestonesResponse, metricsResponse, updatesResponse, mentorsResponse] = 
          await Promise.all([
            api.get('/dashboard/startup/info'),
            api.get('/dashboard/startup/milestones'),
            api.get('/dashboard/startup/metrics'),
            api.get('/dashboard/startup/updates'),
            api.get('/dashboard/startup/mentors')
          ])
        
        this.startup = startupResponse.data
        this.milestones = milestonesResponse.data
        this.metrics = metricsResponse.data
        this.recentUpdates = updatesResponse.data
        this.mentors = mentorsResponse.data
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
/* Базовые стили от BusinessmanDashboard */

.startup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}

.status.idea { background: #fff3e0; color: #ef6c00; }
.status.mvp { background: #e3f2fd; color: #1976d2; }
.status.launched { background: #e8f5e9; color: #2e7d32; }
.status.scaling { background: #f3e5f5; color: #7b1fa2; }

.description {
  color: #666;
  margin-bottom: 15px;
}

.milestones {
  position: relative;
}

.milestone-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.milestone-status {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #eee;
  margin-right: 15px;
  position: relative;
}

.milestone-item.completed .milestone-status {
  background: #28a745;
}

.milestone-content {
  flex: 1;
}

.milestone-date {
  font-size: 0.9em;
  color: #666;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.metric-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.metric-change.up { color: #28a745; }
.metric-change.down { color: #dc3545; }

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.mentor-item {
  display: flex;
  align-items: start;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.mentor-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.mentor-expertise {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.expertise-tag {
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  color: #666;
}
</style> 