<template>
  <div class="price-chart">
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

export default {
  name: 'CandlestickChart',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    indicators: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chartInstance = null
    let currentSortedData = [] // Сохраняем отсортированные данные для tooltip

    const formatDate = (date) => {
      const d = new Date(date)
      const day = d.getDate()
      const month = d.toLocaleString('ru-RU', { month: 'short' })
      return `${day} ${month}`
    }

    const formatTime = (date) => {
      const d = new Date(date)
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }

    const formatXAxisLabel = (value) => {
      const date = new Date(value)
      const now = new Date()
      const diffHours = (now - date) / (1000 * 60 * 60)
      
      // Если данные за последние 24 часа - показываем время
      if (diffHours < 24) {
        return formatTime(date)
      }
      // Иначе показываем дату
      return formatDate(date)
    }

    const createChart = async () => {
      if (!chartCanvas.value || !props.data || props.data.length === 0) {
        return
      }

      // Уничтожаем предыдущий график
      if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
      }

      await nextTick()

      const ctx = chartCanvas.value.getContext('2d')
      if (!ctx) return

      // Подготавливаем данные
      // Сортируем данные по времени
      currentSortedData = [...props.data].sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp)
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp)
        return timeA.getTime() - timeB.getTime()
      })
      const sortedData = currentSortedData

      const chartData = sortedData.map((candle, index) => ({
        x: index, // Используем индекс для равномерного распределения
        y: candle.close
      }))

      // Создаем градиент для заливки
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, 'rgba(40, 167, 69, 0.2)')
      gradient.addColorStop(1, 'rgba(40, 167, 69, 0)')

      const datasets = [
        {
          label: 'Цена закрытия',
          data: chartData,
          borderColor: '#28a745',
          backgroundColor: gradient,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#28a745',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0, // Убираем сглаживание для более резких переходов
          spanGaps: false,
          stepped: false // Прямые линии между точками
        }
      ]

      // Добавляем индикаторы
      props.indicators.forEach((indicator, index) => {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf']
        datasets.push({
          label: indicator.name,
          data: indicator.data || [],
          borderColor: indicator.color || colors[index % colors.length],
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 3,
          fill: false,
          tension: 0 // Убираем сглаживание для индикаторов
        })
      })

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'start',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 12,
                  family: 'inherit'
                },
                color: '#333'
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              padding: 12,
              titleFont: {
                size: 13,
                weight: 'bold'
              },
              bodyFont: {
                size: 12
              },
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              callbacks: {
                title: (items) => {
                  if (items.length > 0 && items[0].dataIndex !== undefined) {
                    const index = items[0].dataIndex;
                    if (index >= 0 && index < currentSortedData.length) {
                      const candle = currentSortedData[index];
                      const timestamp = candle.timestamp instanceof Date 
                        ? candle.timestamp 
                        : new Date(candle.timestamp);
                      // Форматируем дату для tooltip
                      const date = new Date(timestamp);
                      return date.toLocaleString('ru-RU', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                    }
                  }
                  return '';
                },
                label: (context) => {
                  const index = context.dataIndex;
                  if (index >= 0 && index < currentSortedData.length) {
                    const candle = currentSortedData[index];
                    return `Цена: ${candle.close.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} $`;
                  }
                  const value = context.parsed.y;
                  if (value && !isNaN(value)) {
                    return `${context.dataset.label}: ${value.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} $`;
                  }
                  return '';
                }
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              ticks: {
                maxTicksLimit: 8,
                stepSize: 1,
                callback: (value) => {
                  const index = Math.round(value)
                  if (index >= 0 && index < sortedData.length) {
                    const candle = sortedData[index]
                    const timestamp = candle.timestamp instanceof Date ? candle.timestamp : new Date(candle.timestamp)
                    return formatXAxisLabel(timestamp)
                  }
                  return ''
                },
                autoSkip: true,
                font: {
                  size: 11
                },
                color: '#666'
              },
              grid: {
                display: false,
                drawBorder: false
              }
            },
            y: {
              position: 'right',
              ticks: {
                callback: (value) => {
                  return value.toLocaleString('ru-RU', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  })
                },
                font: {
                  size: 11
                },
                color: '#666',
                padding: 10
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false,
                lineWidth: 1
              }
            }
          },
          elements: {
            point: {
              hoverRadius: 6
            }
          }
        }
      })
    }

    onMounted(() => {
      if (props.data && props.data.length > 0) {
        createChart()
      }
    })

    watch([() => props.data, () => props.indicators], () => {
      if (props.data && props.data.length > 0) {
        createChart()
      }
    }, { deep: true, immediate: false })

    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
      }
    })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.price-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
}

.chart-wrapper canvas {
  max-height: 100%;
}
</style>
