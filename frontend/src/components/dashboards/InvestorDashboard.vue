<template>
  <div class="dashboard-content">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Портфель инвестиций</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatMoney(stats.totalInvested) }}</span>
            <span class="stat-label">Всего инвестировано</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeInvestments }}</span>
            <span class="stat-label">Активных инвестиций</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.roi }}%</span>
            <span class="stat-label">Средний ROI</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Проекты на рассмотрении</h3>
        <div class="project-list">
          <div v-for="project in pendingProjects" 
               :key="project.id" 
               class="project-item"
          >
            <div class="project-info">
              <h4>{{ project.title }}</h4>
              <p>{{ project.description }}</p>
            </div>
            <div class="project-actions">
              <BaseButton 
                variant="primary" 
                @click="viewProject(project.id)"
              >
                Подробнее
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="investment-chart">
      <h3>Динамика инвестиций</h3>
      <!-- Здесь будет компонент графика -->
    </div>

    <div class="recent-activities">
      <h3>Последние транзакции</h3>
      <div class="transactions-list">
        <div v-for="transaction in recentTransactions" 
             :key="transaction.id" 
             class="transaction-item"
        >
          <div class="transaction-icon" :class="transaction.type">
            {{ getTransactionIcon(transaction.type) }}
          </div>
          <div class="transaction-details">
            <div class="transaction-header">
              <h4>{{ transaction.title }}</h4>
              <span :class="['amount', transaction.type]">
                {{ formatMoney(transaction.amount) }}
              </span>
            </div>
            <p>{{ transaction.description }}</p>
            <span class="transaction-time">
              {{ formatTime(transaction.time) }}
            </span>
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
  name: 'InvestorDashboard',
  components: {
    BaseButton
  },
  data() {
    return {
      stats: {
        totalInvested: 0,
        activeInvestments: 0,
        roi: 0
      },
      pendingProjects: [],
      recentTransactions: []
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
    getTransactionIcon(type) {
      const icons = {
        investment: '💰',
        withdrawal: '📤',
        return: '💸',
        dividend: '💵'
      }
      return icons[type] || '🔄'
    },
    async loadDashboardData() {
      try {
        const [statsResponse, projectsResponse, transactionsResponse] = await Promise.all([
          api.get('/dashboard/investor/stats'),
          api.get('/dashboard/investor/pending-projects'),
          api.get('/dashboard/investor/transactions')
        ])
        
        this.stats = statsResponse.data
        this.pendingProjects = projectsResponse.data
        this.recentTransactions = transactionsResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке данных дашборда:', error)
      }
    },
    viewProject(projectId) {
      this.$router.push(`/projects/${projectId}`)
    }
  },
  created() {
    this.loadDashboardData()
  }
}
</script>

<style scoped>
/* Стили аналогичны BusinessmanDashboard с дополнительными классами */
.transaction-item {
  display: flex;
  align-items: start;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
}

.transaction-details {
  flex: 1;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.amount {
  font-weight: bold;
}

.amount.investment {
  color: #dc3545;
}

.amount.return, .amount.dividend {
  color: #28a745;
}

.transaction-time {
  font-size: 12px;
  color: #666;
}

.project-list {
  max-height: 400px;
  overflow-y: auto;
}

.project-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.project-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.project-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.project-actions {
  margin-top: 10px;
}
</style> 