<template>
  <div class="project-card">
    <div class="project-header">
      <h3>{{ project.title }}</h3>
      <span :class="['status', project.status]">{{ project.status }}</span>
    </div>
    <p class="description">{{ project.description }}</p>
    <div class="project-details">
      <div class="detail">
        <span class="label">Инвестиции:</span>
        <span class="value">{{ project.investment }}₽</span>
      </div>
      <div class="detail">
        <span class="label">ROI:</span>
        <span class="value">{{ project.roi }}%</span>
      </div>
    </div>
    <div class="project-actions">
      <BaseButton @click="editProject">Редактировать</BaseButton>
      <BaseButton 
        variant="secondary" 
        @click="viewInvestors">
        Инвесторы
      </BaseButton>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'BusinessProject',
  components: {
    BaseButton
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  methods: {
    editProject() {
      this.$emit('edit', this.project.id)
    },
    viewInvestors() {
      this.$emit('view-investors', this.project.id)
    }
  }
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
}

.status.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status.pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.description {
  color: #666;
  margin-bottom: 15px;
}

.project-details {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.detail {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.9em;
  color: #666;
}

.value {
  font-weight: 500;
  color: #2c3e50;
}

.project-actions {
  display: flex;
  gap: 10px;
}
</style> 