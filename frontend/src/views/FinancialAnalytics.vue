<template>
  <div class="financial-analytics">
    <h1>Финансовая аналитика</h1>
    
    <div class="analytics-grid">
      <!-- Общая статистика -->
      <div class="stats-card">
        <h3>Общая статистика</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ formatMoney(stats.totalValue) }}</span>
            <span class="stat-label">Общая стоимость</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" :class="stats.dailyChange >= 0 ? 'positive' : 'negative'">
              {{ stats.dailyChange > 0 ? '+' : '' }}{{ stats.dailyChange }}%
            </span>
            <span class="stat-label">Изменение за 24ч</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeDeals }}</span>
            <span class="stat-label">Активные сделки</span>
          </div>
        </div>
      </div>

      <!-- График динамики -->
      <div class="chart-card">
        <h3>Динамика портфеля</h3>
        <div class="chart-container">
          <canvas ref="portfolioChart"></canvas>
        </div>
      </div>

      <!-- Распределение активов -->
      <div class="chart-card">
        <h3>Распределение активов</h3>
        <div class="chart-container">
          <canvas ref="assetsChart"></canvas>
        </div>
      </div>

      <!-- Последние транзакции -->
      <div class="transactions-card">
        <h3>Последние транзакции</h3>
        <div class="transactions-list">
          <div v-for="tx in recentTransactions" 
               :key="tx.id" 
               class="transaction-item"
          >
            <div class="transaction-icon" :class="tx.type">
              {{ getTransactionIcon(tx.type) }}
            </div>
            <div class="transaction-details">
              <div class="transaction-header">
                <h4>{{ tx.title }}</h4>
                <span :class="['amount', tx.type]">
                  {{ tx.type === 'expense' ? '-' : '+' }}{{ formatMoney(tx.amount) }}
                </span>
              </div>
              <p>{{ tx.description }}</p>
              <span class="transaction-time">{{ formatTime(tx.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/axios'

export default {
  name: 'FinancialAnalytics',
  data() {
    return {
      stats: {
        totalValue: 0,
        dailyChange: 0,
        activeDeals: 0
      },
      recentTransactions: [],
      portfolioChart: null,
      assetsChart: null
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
        income: '📥',
        expense: '📤',
        transfer: '🔄'
      }
      return icons[type] || '💸'
    },
    async loadAnalyticsData() {
      try {
        const [statsResponse, transactionsResponse] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/transactions')
        ])
        
        this.stats = statsResponse.data
        this.recentTransactions = transactionsResponse.data
        this.createCharts()
      } catch (error) {
        console.error('Ошибка при загрузке данных аналитики:', error)
      }
    },
    createCharts() {
      // График динамики портфеля
      const portfolioCtx = this.$refs.portfolioChart.getContext('2d')
      this.portfolioChart = new Chart(portfolioCtx, {
        type: 'line',
        data: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
          datasets: [{
            label: 'Стоимость портфеля',
            data: [100000, 120000, 115000, 130000, 125000, 140000],
            borderColor: '#28a745',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Динамика портфеля'
            }
          }
        }
      })

      // График распределения активов
      const assetsCtx = this.$refs.assetsChart.getContext('2d')
      this.assetsChart = new Chart(assetsCtx, {
        type: 'doughnut',
        data: {
          labels: ['Акции', 'Облигации', 'Криптовалюта', 'Наличные'],
          datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: [
              '#28a745',
              '#17a2b8',
              '#ffc107',
              '#6c757d'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            }
          }
        }
      })
    }
  },
  mounted() {
    this.loadAnalyticsData()
  }
}
</script>

<style scoped>
.financial-analytics {
  padding: 20px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stats-card, .chart-card, .transactions-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.positive {
  color: #28a745;
}

.stat-value.negative {
  color: #dc3545;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.chart-container {
  height: 300px;
  margin-top: 15px;
}

.transactions-list {
  max-height: 400px;
  overflow-y: auto;
}

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

.amount.income {
  color: #28a745;
}

.amount.expense {
  color: #dc3545;
}

.transaction-time {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style> 