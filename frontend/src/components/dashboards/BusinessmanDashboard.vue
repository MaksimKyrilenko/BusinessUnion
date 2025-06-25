<template>
  <div class="businessman-dashboard">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h2>Бизнес-аналитика</h2>
        <div class="card-content">
          <p>Здесь будет бизнес-аналитика</p>
        </div>
      </div>
      
      <div class="dashboard-card">
        <h2>Рыночные тренды</h2>
        <div class="card-content">
          <p>Здесь будут рыночные тренды</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BusinessmanDashboard'
})
</script>

<style scoped>
.businessman-dashboard {
  margin-top: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.dashboard-card h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}
</style> 