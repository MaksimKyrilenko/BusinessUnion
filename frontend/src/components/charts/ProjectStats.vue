<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'ProjectStats',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.createChart()
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.labels,
          datasets: [{
            label: 'Инвестиции',
            data: this.data.values,
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
              text: 'Динамика инвестиций'
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}
</style> 