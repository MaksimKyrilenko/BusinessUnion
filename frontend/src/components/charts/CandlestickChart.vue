<template>
  <div class="candlestick-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { ru } from 'date-fns/locale'

// Регистрируем необходимые компоненты
Chart.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'CandlestickChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    indicators: {
      type: Array,
      default: () => []
    },
    timeframe: {
      type: String,
      default: '1d'
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chart = null

    const createChart = () => {
      if (!props.data || props.data.length === 0) return

      if (chart) {
        chart.destroy()
      }

      const ctx = chartCanvas.value.getContext('2d')
      
      const timeUnit = props.timeframe === '1d' ? 'hour' : 'day'
      
      chart = new Chart(ctx, {
        type: 'line', // Временно меняем на line, пока не настроим candlestick
        data: {
          datasets: [
            {
              label: 'Цена закрытия',
              data: props.data.map(candle => ({
                x: new Date(candle.timestamp),
                y: candle.close
              })),
              borderColor: '#28a745',
              borderWidth: 1,
              pointRadius: 0,
              fill: false
            },
            ...props.indicators.map(indicator => ({
              label: indicator.name,
              data: indicator.data.map(point => ({
                x: new Date(point.timestamp),
                y: point.value
              })),
              borderColor: indicator.color,
              borderWidth: 1,
              pointRadius: 0,
              fill: false
            }))
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timeUnit,
                displayFormats: {
                  hour: 'HH:mm',
                  day: 'dd MMM',
                  week: 'dd MMM',
                  month: 'MMM yyyy'
                }
              },
              adapters: {
                date: {
                  locale: ru
                }
              },
              grid: {
                display: false
              }
            },
            y: {
              position: 'right',
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
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
              intersect: false
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

    watch([() => props.data, () => props.indicators, () => props.timeframe], () => {
      createChart()
    })

    onBeforeUnmount(() => {
      if (chart) {
        chart.destroy()
      }
    })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.candlestick-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style> 