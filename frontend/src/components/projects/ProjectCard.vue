<template>
  <div class="project-card" @click="$emit('click')">
    <div class="project-header">
      <h3>{{ project.title }}</h3>
      <span :class="['status', project.status]">
        {{ getStatusText(project.status) }}
      </span>
    </div>

    <div class="project-image" v-if="project.image">
      <img :src="project.image" :alt="project.title">
    </div>

    <p class="description">{{ truncateDescription(project.description) }}</p>

    <div class="project-details">
      <div class="detail-item">
        <span class="label">Инвестиции:</span>
        <span class="value">{{ formatMoney(project.investmentNeeded) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">Собрано:</span>
        <span class="value">{{ formatMoney(project.investmentCollected) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">ROI:</span>
        <span class="value">{{ project.expectedRoi }}%</span>
      </div>
    </div>

    <div class="project-footer">
      <div class="author">
        <img :src="project.author.avatar" :alt="project.author.name" class="author-avatar">
        <span>{{ project.author.name }}</span>
      </div>
      <div class="actions">
        <BaseButton 
          v-if="canEdit"
          variant="secondary"
          @click.stop="$emit('edit')"
        >
          Редактировать
        </BaseButton>
        <BaseButton 
          v-if="canInvest"
          @click.stop="$emit('invest')"
        >
          Инвестировать
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'ProjectCard',
  components: {
    BaseButton
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  computed: {
    canEdit() {
      return this.project.author.id === this.currentUserId
    },
    canInvest() {
      return this.userType === 'investor' && 
             this.project.author.id !== this.currentUserId &&
             this.project.status === 'active'
    },
    currentUserId() {
      // Получаем ID текущего пользователя из хранилища или vuex
      return localStorage.getItem('userId')
    },
    userType() {
      // Получаем тип пользователя из хранилища или vuex
      return localStorage.getItem('userType')
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    getStatusText(status) {
      const statuses = {
        active: 'Активный',
        pending: 'На рассмотрении',
        completed: 'Завершен'
      }
      return statuses[status] || status
    },
    truncateDescription(text) {
      return text.length > 150 ? text.substring(0, 147) + '...' : text
    }
  }
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.project-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.status.active { background: #e8f5e9; color: #2e7d32; }
.status.pending { background: #fff3e0; color: #ef6c00; }
.status.completed { background: #f5f5f5; color: #666; }

.project-image {
  width: 100%;
  height: 200px;
  margin-bottom: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.project-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.detail-item {
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

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.actions {
  display: flex;
  gap: 10px;
}
</style> 