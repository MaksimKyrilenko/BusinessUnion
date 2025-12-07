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
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
  position: relative;
}

.market-analytics::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

.market-analytics h1 {
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  color: #1e293b;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin: 0;
  position: relative;
  z-index: 1;
  border-left: 4px solid #2563eb;
}

.market-analytics h1::before {
  content: '\f201';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 1rem;
  color: #2563eb;
}

.market-analytics h1::after {
  display: none;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}

.metrics-card, .chart-card, .sectors-card, .trends-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  height: 100%;
}

.metrics-card:hover, .chart-card:hover, .sectors-card:hover, .trends-card:hover {
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
}

.metrics-card h2, .chart-card h2, .sectors-card h2, .trends-card h2 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metrics-card h2::before,
.chart-card h2::before,
.sectors-card h2::before,
.trends-card h2::before {
  content: '';
  width: 3px;
  height: 16px;
  background: #2563eb;
  border-radius: 2px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.metric-item {
  text-align: center;
  padding: 0.625rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.metric-item::before {
  display: none;
}

.metric-item:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.metric-item:nth-child(1) { border-left: 3px solid #2563eb; }
.metric-item:nth-child(2) { border-left: 3px solid #7c3aed; }
.metric-item:nth-child(3) { border-left: 3px solid #ec4899; }

.metric-label {
  font-size: 0.65rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.metric-change {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
}

.metric-change.positive {
  color: #059669;
  background: #d1fae5;
}

.metric-change.negative {
  color: #dc2626;
  background: #fee2e2;
}

.chart-container {
  height: 220px;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.sectors-list {
  margin-top: 0.5rem;
}

.sector-item {
  margin-bottom: 0.625rem;
  padding: 0.625rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.sector-item:hover {
  border-color: #2563eb;
}

.sector-item:nth-child(1) { border-left: 3px solid #2563eb; }
.sector-item:nth-child(2) { border-left: 3px solid #7c3aed; }
.sector-item:nth-child(3) { border-left: 3px solid #ec4899; }
.sector-item:nth-child(4) { border-left: 3px solid #059669; }
.sector-item:nth-child(5) { border-left: 3px solid #f59e0b; }

.sector-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.sector-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1e293b;
}

.sector-value {
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
}

.progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #2563eb;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.trends-list {
  margin-top: 0.5rem;
}

.trend-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.trend-item:hover {
  border-color: #2563eb;
}

.trend-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 0.85rem;
}

.trend-icon.up {
  background: #059669;
}

.trend-icon.down {
  background: #dc2626;
}

.trend-icon.neutral {
  background: #64748b;
}

.trend-content {
  flex: 1;
}

.trend-title {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1e293b;
  margin-bottom: 0.15rem;
}

.trend-description {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

@media (max-width: 960px) {
  .market-analytics {
    padding: 0.75rem;
  }
  
  .market-analytics h1 {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .market-analytics h1 {
    font-size: 0.9rem;
    padding: 0.625rem 0.875rem;
  }
  
  .metric-value {
    font-size: 1rem;
  }
}
</style> 