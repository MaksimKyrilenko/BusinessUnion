<template>
  <div class="liquidations-chart">
    <div class="chart-header">
      <div class="total-liquidations">
        <div class="total-icon">💥</div>
        <div class="total-content">
          <div class="total-value">
            {{ formatMoney(totalLiquidations) }}
          </div>
          <div class="total-label">
            Всего ликвидаций (24ч)
          </div>
        </div>
      </div>
      
      <div class="liquidation-stats">
        <div class="stat-card long-stat">
          <div class="stat-header">
            <div class="stat-icon">📈</div>
            <div class="stat-label">Long</div>
            <div class="stat-percent">{{ getLongPercent() }}%</div>
          </div>
          <div class="stat-value positive">
            {{ formatMoney(longLiquidations) }}
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill long-fill" :style="{ width: getLongPercent() + '%' }"></div>
          </div>
        </div>
        
        <div class="stat-card short-stat">
          <div class="stat-header">
            <div class="stat-icon">📉</div>
            <div class="stat-label">Short</div>
            <div class="stat-percent">{{ getShortPercent() }}%</div>
          </div>
          <div class="stat-value negative">
            {{ formatMoney(shortLiquidations) }}
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill short-fill" :style="{ width: getShortPercent() + '%' }"></div>
          </div>
        </div>
      </div>
      
      <div class="liquidation-ratio">
        <div class="ratio-label">Соотношение Long/Short</div>
        <div class="ratio-value">{{ getRatio() }}</div>
      </div>
    </div>
    
    <div class="chart-container">
      <div v-if="!data || data.length === 0" class="empty-state">
        <p>Данные о ликвидациях загружаются...</p>
      </div>
      <canvas v-else ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'LiquidationsChart',
  props: {
    data: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(item => 
          'timestamp' in item && 
          'longAmount' in item && 
          'shortAmount' in item
        )
      }
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chart = null

    const longLiquidations = computed(() => {
      return props.data.reduce((sum, item) => sum + item.longAmount, 0)
    })

    const shortLiquidations = computed(() => {
      return props.data.reduce((sum, item) => sum + item.shortAmount, 0)
    })

    const totalLiquidations = computed(() => {
      return longLiquidations.value + shortLiquidations.value
    })

    const getLongPercent = () => {
      if (totalLiquidations.value === 0) return 0
      return ((longLiquidations.value / totalLiquidations.value) * 100).toFixed(1)
    }

    const getShortPercent = () => {
      if (totalLiquidations.value === 0) return 0
      return ((shortLiquidations.value / totalLiquidations.value) * 100).toFixed(1)
    }

    const getRatio = () => {
      if (shortLiquidations.value === 0) return '∞:1'
      const ratio = (longLiquidations.value / shortLiquidations.value).toFixed(2)
      return `${ratio}:1`
    }

    const formatMoney = (value) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }

    const createChart = () => {
      if (!chartCanvas.value) {
        console.warn('⚠️ LiquidationsChart: canvas элемент не найден')
        return
      }

      if (chart) {
        chart.destroy()
        chart = null
      }

      // Проверяем наличие данных
      if (!props.data) {
        console.warn('⚠️ LiquidationsChart: props.data отсутствует')
        return
      }

      if (!Array.isArray(props.data)) {
        console.warn('⚠️ LiquidationsChart: props.data не является массивом:', typeof props.data)
        return
      }

      if (props.data.length === 0) {
        console.warn('⚠️ LiquidationsChart: props.data пустой массив')
        return
      }

      console.log(`📊 LiquidationsChart: создание графика с ${props.data.length} точками данных`)
      console.log('📊 Первая точка данных:', props.data[0])
      console.log('📊 Последняя точка данных:', props.data[props.data.length - 1])

      const ctx = chartCanvas.value.getContext('2d')
      
      // Обрабатываем timestamp с улучшенной обработкой ошибок
      const labels = props.data.map((item, index) => {
        try {
          let date
          
          if (item.timestamp instanceof Date) {
            date = item.timestamp
          } else if (typeof item.timestamp === 'string') {
            date = new Date(item.timestamp)
          } else if (typeof item.timestamp === 'number') {
            date = item.timestamp > 1000000000000 
              ? new Date(item.timestamp) 
              : new Date(item.timestamp * 1000)
          } else {
            console.warn(`⚠️ LiquidationsChart: неизвестный формат timestamp в элементе ${index}:`, item.timestamp)
            date = new Date()
          }
          
          if (isNaN(date.getTime())) {
            console.warn(`⚠️ LiquidationsChart: невалидная дата в элементе ${index}`)
            return 'N/A'
          }
          
          return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        } catch (error) {
          console.warn(`⚠️ LiquidationsChart: ошибка обработки timestamp в элементе ${index}:`, error)
          return 'N/A'
        }
      })

      const longData = props.data.map(item => {
        const value = Number(item.longAmount) || 0
        return value
      })

      const shortData = props.data.map(item => {
        const value = Number(item.shortAmount) || 0
        return value
      })

      console.log(`📊 Long данные: мин=${Math.min(...longData)}, макс=${Math.max(...longData)}, сумма=${longData.reduce((a, b) => a + b, 0)}`)
      console.log(`📊 Short данные: мин=${Math.min(...shortData)}, макс=${Math.max(...shortData)}, сумма=${shortData.reduce((a, b) => a + b, 0)}`)

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Long ликвидации',
              data: longData,
              backgroundColor: 'rgba(40, 167, 69, 0.5)',
              borderColor: '#28a745',
              borderWidth: 1
            },
            {
              label: 'Short ликвидации',
              data: shortData,
              backgroundColor: 'rgba(220, 53, 69, 0.5)',
              borderColor: '#dc3545',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false
              }
            },
            y: {
              stacked: true,
              position: 'right',
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: (value) => {
                  return formatMoney(value)
                }
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${formatMoney(context.parsed.y)}`
                }
              }
            }
          }
        }
      })
    }

    onMounted(() => {
      // Небольшая задержка для гарантии, что canvas готов
      setTimeout(() => {
        createChart()
      }, 100)
    })

    watch(() => props.data, (newData, oldData) => {
      // Обновляем график при изменении данных
      console.log('🔄 LiquidationsChart: данные изменились', {
        oldLength: oldData?.length || 0,
        newLength: newData?.length || 0,
        isArray: Array.isArray(newData),
        hasData: newData && newData.length > 0
      })
      
      if (newData && Array.isArray(newData) && newData.length > 0) {
        // Небольшая задержка для гарантии, что DOM обновлен
        setTimeout(() => {
          createChart()
        }, 100)
      } else {
        // Если данных нет, уничтожаем график
        if (chart) {
          chart.destroy()
          chart = null
        }
      }
    }, { deep: true, immediate: false })

    return {
      chartCanvas,
      longLiquidations,
      shortLiquidations,
      totalLiquidations,
      formatMoney,
      getLongPercent,
      getShortPercent,
      getRatio
    }
  }
}
</script>

<style scoped>
.liquidations-chart {
  padding: 1.5rem;
}

.chart-header {
  margin-bottom: 2rem;
}

.total-liquidations {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  color: white;
}

.total-icon {
  font-size: 2.5rem;
}

.total-content {
  text-align: center;
}

.total-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.total-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.liquidation-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.long-stat {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
  border-color: rgba(40, 167, 69, 0.3);
}

.short-stat {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  border-color: rgba(220, 53, 69, 0.3);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-label {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.stat-percent {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.long-stat .stat-percent {
  color: #28a745;
}

.short-stat .stat-percent {
  color: #dc3545;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.stat-value.positive {
  color: #28a745;
}

.stat-value.negative {
  color: #dc3545;
}

.stat-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.long-fill {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.short-fill {
  background: linear-gradient(90deg, #dc3545, #c82333);
}

.liquidation-ratio {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.ratio-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.ratio-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.chart-container {
  height: 300px;
  margin-top: 1rem;
  position: relative;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .liquidations-chart {
    padding: 1rem;
  }

  .total-liquidations {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }

  .total-value {
    font-size: 1.5rem;
  }

  .liquidation-stats {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }
}
</style> 