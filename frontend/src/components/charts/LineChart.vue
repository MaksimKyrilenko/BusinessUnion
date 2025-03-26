<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'LineChart',
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    let chart = null

    const createChart = (canvas) => {
      const ctx = canvas.getContext('2d')
      
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: props.data.labels || [],
          datasets: props.data.datasets || []
        },
        options: { ...defaultOptions, ...props.options }
      })
    }

    const updateChart = () => {
      if (chart) {
        chart.data.labels = props.data.labels || []
        chart.data.datasets = props.data.datasets || []
        chart.update()
      }
    }

    onMounted(() => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        createChart(canvas)
      }
    })

    onBeforeUnmount(() => {
      if (chart) {
        chart.destroy()
      }
    })

    watch(() => props.data, () => {
      updateChart()
    }, { deep: true })

    return {}
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
}
</style> 