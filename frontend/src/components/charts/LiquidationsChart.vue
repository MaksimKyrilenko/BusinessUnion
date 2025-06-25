<template>
  <div class="liquidations-chart">
    <div class="chart-header">
      <div class="total-liquidations">
        <div class="total-value">
          {{ formatMoney(totalLiquidations) }}
        </div>
        <div class="total-label">
          Всего ликвидаций (24ч)
        </div>
      </div>
      <div class="liquidation-types">
        <div class="long-liquidations">
          <div class="type-label">Long</div>
          <div class="type-value positive">
            {{ formatMoney(longLiquidations) }}
          </div>
        </div>
        <div class="short-liquidations">
          <div class="type-label">Short</div>
          <div class="type-value negative">
            {{ formatMoney(shortLiquidations) }}
          </div>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
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

    const formatMoney = (value) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }

    const createChart = () => {
      if (chart) {
        chart.destroy()
      }

      const ctx = chartCanvas.value.getContext('2d')
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: props.data.map(item => {
            const date = new Date(item.timestamp)
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          }),
          datasets: [
            {
              label: 'Long ликвидации',
              data: props.data.map(item => item.longAmount),
              backgroundColor: 'rgba(40, 167, 69, 0.5)',
              borderColor: '#28a745',
              borderWidth: 1
            },
            {
              label: 'Short ликвидации',
              data: props.data.map(item => item.shortAmount),
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
      createChart()
    })

    watch(() => props.data, () => {
      createChart()
    }, { deep: true })

    return {
      chartCanvas,
      longLiquidations,
      shortLiquidations,
      totalLiquidations,
      formatMoney
    }
  }
}
</script>

<style scoped>
.liquidations-chart {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.total-liquidations {
  text-align: center;
  margin-bottom: 1rem;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary-color);
}

.total-label {
  color: #666;
  font-size: 0.9rem;
}

.liquidation-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.long-liquidations, .short-liquidations {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.long-liquidations {
  background: rgba(40, 167, 69, 0.1);
}

.short-liquidations {
  background: rgba(220, 53, 69, 0.1);
}

.type-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.type-value {
  font-weight: 500;
}

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

.chart-container {
  height: 300px;
}

@media (max-width: 768px) {
  .liquidations-chart {
    padding: 1rem;
  }

  .total-value {
    font-size: 1.25rem;
  }

  .chart-container {
    height: 250px;
  }
}
</style> 