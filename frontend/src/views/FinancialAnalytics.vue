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
          <button 
            class="refresh-btn" 
            :class="{ 'spinning': isLoading.pairs }"
            @click="refreshData"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        <div class="pairs-grid">
          <template v-if="isLoading.pairs">
            <div class="loading-overlay">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Загрузка данных...</span>
            </div>
          </template>
          <template v-else-if="!currencyPairs.length">
            <div class="empty-state">
              <i class="fas fa-database"></i>
              <span>Нет доступных валютных пар</span>
            </div>
          </template>
          <template v-else>
            <div
              v-for="pair in currencyPairs"
              :key="pair.symbol"
              class="pair-item"
              @click="selectedPair = pair.symbol"
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
          </template>
        </div>
      </div>

      <!-- График выбранной пары -->
      <div class="analytics-card chart-card">
        <div class="card-header">
          <div class="chart-controls">
            <select v-model="selectedPair">
              <option v-for="pair in currencyPairs" :key="pair.symbol" :value="pair.symbol">
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
        <div class="chart-container" ref="chartContainer">
          <template v-if="!isComponentMounted || isLoading.chart">
            <div class="loading-overlay">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Загрузка графика...</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Технические индикаторы -->
      <div class="analytics-card indicators-card">
        <div class="card-header">
          <h2>Технические индикаторы</h2>
        </div>
        <div class="indicators-grid">
          <template v-if="isLoading.indicators">
            <div class="loading-overlay">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Загрузка индикаторов...</span>
            </div>
          </template>
          <template v-else-if="!technicalIndicators.length">
            <div class="empty-state">
              <i class="fas fa-chart-line"></i>
              <span>Нет доступных индикаторов</span>
            </div>
          </template>
          <template v-else>
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
          </template>
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
          <template v-if="isLoading.summaries">
            <div class="loading-overlay">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Загрузка сводок...</span>
            </div>
          </template>
          <template v-else-if="!filteredSummaries.length">
            <div class="empty-state">
              <i class="fas fa-newspaper"></i>
              <span>Нет доступных сводок</span>
            </div>
          </template>
          <template v-else>
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
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, h, ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import api from '@/axios'

export default defineComponent({
  name: 'FinancialAnalytics',
  setup() {
    const isComponentMounted = ref(false)
    const selectedRange = ref('1d')
    const selectedPair = ref('EURUSD')
    const selectedChartType = ref('line')
    const selectedAnalysisType = ref('technical')
    const currencyPairs = ref([])
    const technicalIndicators = ref([])
    const summaries = ref([])
    const chartContainer = ref(null)
    const isLoading = ref({
      pairs: false,
      chart: false,
      indicators: false,
      summaries: false
    })
    let chart = null

    // Константы
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

    // Вычисляемые свойства
    const filteredSummaries = computed(() => {
      return summaries.value.filter(summary => 
        summary.type === selectedAnalysisType.value
      )
    })

    const initChart = async () => {
      if (!chartContainer.value || !isComponentMounted.value) return
      
      try {
        if (chart) {
          chart.dispose()
        }

        chart = echarts.init(chartContainer.value)
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#1976d2'
              }
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
              color: '#1e293b'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '8%',
            containLabel: true
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: '#e2e8f0'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: '#64748b',
              formatter: (value) => {
                const date = new Date(value)
                if (selectedRange.value === '1d') {
                  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                }
                return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
              }
            }
          },
          yAxis: {
            type: 'value',
            position: 'right',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                color: '#e2e8f0',
                type: 'dashed'
              }
            },
            axisLabel: {
              color: '#64748b',
              formatter: (value) => formatPrice(value)
            }
          },
          series: [{
            type: 'line',
            data: [],
            showSymbol: false,
            smooth: true
          }]
        }

        chart.setOption(option)
        return true
      } catch (error) {
        console.error('Ошибка инициализации графика:', error)
        return false
      }
    }

    const updateChartData = async () => {
      if (!chart || !isComponentMounted.value || isLoading.value.chart) return
      
      isLoading.value.chart = true
      try {
        const response = await api.get(`/chart-data/${selectedPair.value}`, {
          params: {
            range: selectedRange.value,
            type: selectedChartType.value
          }
        })

        if (!chart || !isComponentMounted.value) return

        chart.setOption({
          series: [{
            data: response.data || []
          }]
        })
      } catch (error) {
        console.error('Ошибка обновления данных графика:', error)
      } finally {
        isLoading.value.chart = false
      }
    }

    // API функции
    const loadCurrencyPairs = async () => {
      if (isLoading.value.pairs) return
      isLoading.value.pairs = true
      try {
        const response = await api.get('/currency-pairs')
        currencyPairs.value = response.data || []
      } catch (error) {
        console.error('Ошибка загрузки валютных пар:', error)
      } finally {
        isLoading.value.pairs = false
      }
    }

    const loadTechnicalIndicators = async () => {
      if (isLoading.value.indicators) return
      isLoading.value.indicators = true
      try {
        const response = await api.get(`/technical-indicators/${selectedPair.value}`)
        technicalIndicators.value = response.data || []
      } catch (error) {
        console.error('Ошибка загрузки индикаторов:', error)
      } finally {
        isLoading.value.indicators = false
      }
    }

    const loadSummaries = async () => {
      if (isLoading.value.summaries) return
      isLoading.value.summaries = true
      try {
        const response = await api.get('/market-summaries')
        summaries.value = response.data || []
      } catch (error) {
        console.error('Ошибка загрузки сводок:', error)
      } finally {
        isLoading.value.summaries = false
      }
    }

    // Вспомогательные функции
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

    // Обработчики событий
    const handleResize = () => {
      if (chart) {
        chart.resize()
      }
    }

    const refreshData = async () => {
      try {
        await Promise.all([
          loadCurrencyPairs(),
          loadTechnicalIndicators(),
          loadSummaries()
        ])
      } catch (error) {
        console.error('Ошибка обновления данных:', error)
      }
    }

    onMounted(async () => {
      try {
        // Загружаем данные параллельно
        const dataPromises = [
          loadCurrencyPairs(),
          loadTechnicalIndicators(),
          loadSummaries()
        ]
        
        // Инициализируем график сразу после монтирования
        await nextTick()
        const chartInitialized = await initChart()
        
        // Дожидаемся загрузки данных
        await Promise.all(dataPromises)
        
        // Устанавливаем флаг монтирования и обновляем график
        isComponentMounted.value = true
        if (chartInitialized) {
          await updateChartData()
        }

        // Добавляем обработчик ресайза
        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('Ошибка инициализации компонента:', error)
      }
    })

    onUnmounted(() => {
      isComponentMounted.value = false
      if (chart) {
        chart.dispose()
        chart = null
      }
    })

    // Наблюдатели
    watch([selectedRange, selectedChartType], () => {
      if (isComponentMounted.value) {
        updateChartData()
      }
    })

    watch(selectedPair, () => {
      if (isComponentMounted.value) {
        Promise.all([
          updateChartData(),
          loadTechnicalIndicators()
        ])
      }
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
      refreshData,
      formatPrice,
      formatChange,
      formatTime,
      isLoading
    }
  }
})
</script>

<style scoped>
.financial-analytics {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 60px;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
}

.analytics-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.15);
}

.analytics-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 600;
}

.time-range {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.range-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
}

.range-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.range-btn.active {
  background: white;
  color: #1976d2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.analytics-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
}

.card-header {
  padding: 1.75rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #f8fafc, #ffffff);
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.refresh-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  color: #1976d2;
  background: #f1f5f9;
}

.refresh-btn i {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.refresh-btn:hover i {
  transform: rotate(180deg);
}

.refresh-btn.spinning i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  padding: 1.75rem;
}

.pair-item {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pair-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-color: #1976d2;
}

.pair-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pair-symbol {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.pair-name {
  font-size: 0.9rem;
  color: #64748b;
}

.pair-data {
  text-align: right;
}

.pair-price {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.pair-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.pair-change.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.pair-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.chart-card {
  grid-column: span 2;
}

.chart-controls {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.chart-controls select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 0.95rem;
  min-width: 200px;
  outline: none;
  transition: all 0.2s ease;
}

.chart-controls select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.chart-type {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 8px;
}

.type-btn {
  padding: 0.75rem;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.type-btn:hover {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}

.type-btn.active {
  background: white;
  color: #1976d2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  padding: 1.75rem;
  height: 450px;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  padding: 1.75rem;
}

.indicator-item {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.indicator-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.indicator-name {
  font-weight: 600;
  color: #1e293b;
}

.indicator-signal {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

.indicator-signal.buy {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.indicator-signal.sell {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.indicator-signal.neutral {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.indicator-value {
  font-size: 1.2rem;
  font-weight: 500;
  color: #1e293b;
  margin-top: 0.5rem;
}

.summary-card {
  grid-column: span 2;
}

.summary-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.summary-filters select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.summary-filters select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.summary-content {
  padding: 1.75rem;
  display: grid;
  gap: 1.25rem;
}

.summary-item {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.summary-item:hover {
  transform: translateX(4px);
  border-color: #1976d2;
  background: white;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}

.summary-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.1rem;
}

.summary-time {
  font-size: 0.9rem;
  color: #64748b;
}

.summary-text {
  color: #475569;
  line-height: 1.6;
  margin: 1rem 0;
}

.summary-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.summary-source,
.summary-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
}

.summary-source i,
.summary-rating i {
  color: #1976d2;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #64748b;
  gap: 1rem;
  min-height: 200px;
}

.loading-overlay i {
  font-size: 2rem;
  color: #1976d2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #64748b;
  gap: 1rem;
  min-height: 200px;
  text-align: center;
}

.empty-state i {
  font-size: 2.5rem;
  color: #94a3b8;
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
    gap: 1.5rem;
    text-align: center;
    padding: 1.5rem;
  }

  .analytics-header h1 {
    font-size: 1.8rem;
  }

  .time-range {
    width: 100%;
    justify-content: center;
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

  .chart-type {
    width: 100%;
    justify-content: center;
  }

  .summary-filters {
    flex-direction: column;
    width: 100%;
  }

  .summary-filters select {
    width: 100%;
  }
}
</style> 