<template>
  <div class="financial-analytics">
    <div class="analytics-header">
      <h1>Финансовая аналитика</h1>
      <div class="time-range">
        <button 
          v-for="range in timeRanges" 
          :key="range.value"
          :class="['range-btn', { active: selectedRange === range.value }]"
          @click="selectedRange = range.value"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <div class="analytics-grid">
      <!-- Основные валютные пары -->
      <div class="analytics-card currency-pairs">
        <div class="card-header">
          <h2>Основные валютные пары</h2>
          <button class="refresh-btn" @click="refreshCurrencyPairs">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        <div class="pairs-grid">
          <div 
            v-for="pair in currencyPairs" 
            :key="pair.symbol"
            class="pair-item"
          >
            <div class="pair-info">
              <div class="pair-symbol">{{ pair.symbol }}</div>
              <div class="pair-name">{{ pair.name }}</div>
            </div>
            <div class="pair-data">
              <div class="pair-price">{{ formatPrice(pair.price) }}</div>
              <div 
                class="pair-change"
                :class="{ 
                  'positive': pair.change > 0,
                  'negative': pair.change < 0 
                }"
              >
                <i :class="['fas', pair.change > 0 ? 'fa-caret-up' : 'fa-caret-down']"></i>
                {{ formatChange(pair.change) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- График выбранной пары -->
      <div class="analytics-card chart-card">
        <div class="card-header">
          <div class="chart-controls">
            <select v-model="selectedPair" @change="updateChart">
              <option 
                v-for="pair in currencyPairs" 
                :key="pair.symbol" 
                :value="pair.symbol"
              >
                {{ pair.name }}
              </option>
            </select>
            <div class="chart-type">
              <button 
                v-for="type in chartTypes" 
                :key="type.value"
                :class="['type-btn', { active: selectedChartType === type.value }]"
                @click="selectedChartType = type.value"
              >
                <i :class="type.icon"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="chart-container" ref="chartContainer"></div>
      </div>

      <!-- Технические индикаторы -->
      <div class="analytics-card indicators-card">
        <div class="card-header">
          <h2>Технические индикаторы</h2>
        </div>
        <div class="indicators-grid">
          <div 
            v-for="indicator in technicalIndicators" 
            :key="indicator.name"
            class="indicator-item"
          >
            <div class="indicator-header">
              <span class="indicator-name">{{ indicator.name }}</span>
              <div 
                class="indicator-signal"
                :class="indicator.signal.toLowerCase()"
              >
                {{ indicator.signal }}
              </div>
            </div>
            <div class="indicator-value">
              {{ indicator.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- Аналитические сводки -->
      <div class="analytics-card summary-card">
        <div class="card-header">
          <h2>Аналитические сводки</h2>
          <div class="summary-filters">
            <select v-model="selectedAnalysisType">
              <option value="technical">Техническая аналитика</option>
              <option value="fundamental">Фундаментальная аналитика</option>
              <option value="sentiment">Настроения рынка</option>
            </select>
          </div>
        </div>
        <div class="summary-content">
          <div 
            v-for="summary in filteredSummaries" 
            :key="summary.id"
            class="summary-item"
          >
            <div class="summary-header">
              <span class="summary-title">{{ summary.title }}</span>
              <span class="summary-time">{{ formatTime(summary.timestamp) }}</span>
            </div>
            <p class="summary-text">{{ summary.text }}</p>
            <div class="summary-meta">
              <div class="summary-source">
                <i class="fas fa-user-tie"></i>
                {{ summary.analyst }}
              </div>
              <div class="summary-rating">
                <i class="fas fa-star"></i>
                {{ summary.rating }}/5
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import api from '@/axios'

export default {
  name: 'FinancialAnalytics',
  setup() {
    const selectedRange = ref('1d')
    const selectedPair = ref('EURUSD')
    const selectedChartType = ref('line')
    const selectedAnalysisType = ref('technical')
    const currencyPairs = ref([])
    const technicalIndicators = ref([])
    const summaries = ref([])
    const chartInstance = ref(null)
    const chartContainer = ref(null)

    const timeRanges = [
      { label: '1Д', value: '1d' },
      { label: '1Н', value: '1w' },
      { label: '1М', value: '1m' },
      { label: '3М', value: '3m' },
      { label: '1Г', value: '1y' }
    ]

    const chartTypes = [
      { value: 'line', icon: 'fas fa-chart-line' },
      { value: 'candlestick', icon: 'fas fa-chart-bar' },
      { value: 'area', icon: 'fas fa-chart-area' }
    ]

    const filteredSummaries = computed(() => {
      return summaries.value.filter(summary => 
        summary.type === selectedAnalysisType.value
      )
    })

    const loadCurrencyPairs = async () => {
      try {
        const response = await api.get('/currency-pairs')
        currencyPairs.value = response.data
      } catch (error) {
        console.error('Ошибка при загрузке валютных пар:', error)
      }
    }

    const loadTechnicalIndicators = async () => {
      try {
        const response = await api.get(`/technical-indicators/${selectedPair.value}`)
        technicalIndicators.value = response.data
      } catch (error) {
        console.error('Ошибка при загрузке технических индикаторов:', error)
      }
    }

    const loadSummaries = async () => {
      try {
        const response = await api.get('/market-summaries')
        summaries.value = response.data
      } catch (error) {
        console.error('Ошибка при загрузке аналитических сводок:', error)
      }
    }

    const initChart = () => {
      if (!chartContainer.value) return

      chartInstance.value = echarts.init(chartContainer.value)
      updateChart()
    }

    const updateChart = async () => {
      if (!chartInstance.value) return

      try {
        const response = await api.get(`/chart-data/${selectedPair.value}`, {
          params: {
            range: selectedRange.value,
            type: selectedChartType.value
          }
        })

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'time',
            boundaryGap: false
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value}'
            }
          },
          series: [
            {
              name: selectedPair.value,
              type: selectedChartType.value === 'candlestick' ? 'candlestick' : 'line',
              data: response.data,
              itemStyle: {
                color: '#2196F3',
                color0: '#ef5350',
                borderColor: '#2196F3',
                borderColor0: '#ef5350'
              },
              areaStyle: selectedChartType.value === 'area' ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
                  { offset: 1, color: 'rgba(33, 150, 243, 0.1)' }
                ])
              } : undefined
            }
          ]
        }

        chartInstance.value.setOption(option)
      } catch (error) {
        console.error('Ошибка при обновлении графика:', error)
      }
    }

    const refreshCurrencyPairs = () => {
      loadCurrencyPairs()
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }).format(price)
    }

    const formatChange = (change) => {
      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always'
      }).format(change) + '%'
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    watch([selectedRange, selectedChartType], () => {
      updateChart()
    })

    watch(selectedPair, () => {
      updateChart()
      loadTechnicalIndicators()
    })

    onMounted(() => {
      loadCurrencyPairs()
      loadTechnicalIndicators()
      loadSummaries()
      initChart()

      window.addEventListener('resize', () => {
        chartInstance.value?.resize()
      })
    })

    return {
      selectedRange,
      selectedPair,
      selectedChartType,
      selectedAnalysisType,
      currencyPairs,
      technicalIndicators,
      timeRanges,
      chartTypes,
      chartContainer,
      filteredSummaries,
      refreshCurrencyPairs,
      formatPrice,
      formatChange,
      formatTime
    }
  }
}
</script>

<style scoped>
.financial-analytics {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 60px;
}

.analytics-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analytics-header h1 {
  color: #2c3e50;
  margin: 0;
}

.time-range {
  display: flex;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.range-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.range-btn.active {
  background: white;
  color: #2196F3;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.analytics-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.refresh-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  color: #2196F3;
  background: #f5f5f5;
}

.pairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.pair-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pair-symbol {
  font-weight: 500;
  color: #2c3e50;
}

.pair-name {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.pair-price {
  font-weight: 500;
  color: #2c3e50;
  text-align: right;
}

.pair-change {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.pair-change.positive {
  color: #4caf50;
}

.pair-change.negative {
  color: #f44336;
}

.chart-card {
  grid-column: span 2;
}

.chart-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.chart-controls select {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: white;
  color: #2c3e50;
}

.chart-type {
  display: flex;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.type-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.type-btn.active {
  background: white;
  color: #2196F3;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-container {
  height: 400px;
  padding: 1.5rem;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.indicator-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.indicator-name {
  font-weight: 500;
  color: #2c3e50;
}

.indicator-signal {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.indicator-signal.buy {
  background: #e8f5e9;
  color: #2e7d32;
}

.indicator-signal.sell {
  background: #ffebee;
  color: #c62828;
}

.indicator-signal.neutral {
  background: #f5f5f5;
  color: #666;
}

.indicator-value {
  font-size: 0.9rem;
  color: #666;
}

.summary-card {
  grid-column: span 2;
}

.summary-filters {
  display: flex;
  gap: 1rem;
}

.summary-filters select {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: white;
  color: #2c3e50;
}

.summary-content {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.summary-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.summary-title {
  font-weight: 500;
  color: #2c3e50;
}

.summary-time {
  font-size: 0.85rem;
  color: #666;
}

.summary-text {
  color: #2c3e50;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.summary-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.summary-source,
.summary-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 1200px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .chart-card,
  .summary-card {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .financial-analytics {
    padding: 1rem;
  }

  .analytics-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .pairs-grid,
  .indicators-grid {
    grid-template-columns: 1fr;
  }

  .chart-controls {
    flex-direction: column;
    width: 100%;
  }

  .chart-controls select {
    width: 100%;
  }
}
</style> 