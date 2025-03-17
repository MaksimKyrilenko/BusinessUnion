<template>
  <div class="market-analytics">
    <h1>Анализ рынка</h1>
    
    <div class="analytics-grid">
      <!-- Основные показатели -->
      <div class="metrics-card">
        <h2>Основные показатели</h2>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-label">Объем рынка</div>
            <div class="metric-value">{{ formatMoney(marketData.totalVolume) }}</div>
            <div :class="['metric-change', marketData.volumeChange >= 0 ? 'positive' : 'negative']">
              {{ marketData.volumeChange > 0 ? '+' : '' }}{{ marketData.volumeChange }}%
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Средняя сделка</div>
            <div class="metric-value">{{ formatMoney(marketData.avgDeal) }}</div>
            <div :class="['metric-change', marketData.dealChange >= 0 ? 'positive' : 'negative']">
              {{ marketData.dealChange > 0 ? '+' : '' }}{{ marketData.dealChange }}%
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Активные инвесторы</div>
            <div class="metric-value">{{ marketData.activeInvestors }}</div>
            <div :class="['metric-change', marketData.investorsChange >= 0 ? 'positive' : 'negative']">
              {{ marketData.investorsChange > 0 ? '+' : '' }}{{ marketData.investorsChange }}%
            </div>
          </div>
        </div>
      </div>

      <!-- График объема торгов -->
      <div class="chart-card">
        <h2>Объем торгов</h2>
        <div class="chart-container">
          <canvas ref="volumeChart"></canvas>
        </div>
      </div>

      <!-- Топ секторов -->
      <div class="sectors-card">
        <h2>Топ секторов</h2>
        <div class="sectors-list">
          <div v-for="sector in marketData.topSectors" 
               :key="sector.id" 
               class="sector-item"
          >
            <div class="sector-info">
              <div class="sector-name">{{ sector.name }}</div>
              <div class="sector-value">{{ formatMoney(sector.value) }}</div>
            </div>
            <div class="sector-chart">
              <div class="progress-bar">
                <div class="progress" :style="{ width: sector.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Тренды -->
      <div class="trends-card">
        <h2>Тренды</h2>
        <div class="trends-list">
          <div v-for="trend in marketData.trends" 
               :key="trend.id" 
               class="trend-item"
          >
            <div class="trend-icon" :class="trend.type">
              <i :class="getTrendIcon(trend.type)"></i>
            </div>
            <div class="trend-content">
              <div class="trend-title">{{ trend.title }}</div>
              <div class="trend-description">{{ trend.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import api from '@/axios'

export default {
  name: 'MarketAnalytics',
  data() {
    return {
      marketData: {
        totalVolume: 0,
        volumeChange: 0,
        avgDeal: 0,
        dealChange: 0,
        activeInvestors: 0,
        investorsChange: 0,
        topSectors: [],
        trends: []
      },
      volumeChart: null
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    getTrendIcon(type) {
      const icons = {
        up: 'fas fa-arrow-up',
        down: 'fas fa-arrow-down',
        neutral: 'fas fa-minus'
      }
      return icons[type] || 'fas fa-minus'
    },
    async loadMarketData() {
      try {
        const response = await api.get('/analytics/market')
        this.marketData = response.data
        this.$nextTick(() => {
          this.createVolumeChart()
        })
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },
    createVolumeChart() {
      const ctx = this.$refs.volumeChart.getContext('2d')
      this.volumeChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          datasets: [{
            label: 'Объем',
            data: [100, 150, 120, 180, 200, 160, 140],
            borderColor: '#007bff',
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(0, 123, 255, 0.1)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
  },
  mounted() {
    this.loadMarketData()
  }
}
</script>

<style scoped>
.market-analytics {
  padding: 20px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.metrics-card, .chart-card, .sectors-card, .trends-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 0.9em;
}

.metric-change.positive {
  color: #28a745;
}

.metric-change.negative {
  color: #dc3545;
}

.chart-container {
  height: 300px;
  margin-top: 15px;
}

.sectors-list {
  margin-top: 15px;
}

.sector-item {
  margin-bottom: 15px;
}

.sector-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.sector-name {
  font-weight: 500;
}

.sector-value {
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #007bff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.trends-list {
  margin-top: 15px;
}

.trend-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 10px;
}

.trend-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.trend-icon.up {
  background: #28a745;
}

.trend-icon.down {
  background: #dc3545;
}

.trend-icon.neutral {
  background: #6c757d;
}

.trend-content {
  flex: 1;
}

.trend-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.trend-description {
  font-size: 0.9em;
  color: #666;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style> 