<template>
  <div class="my-startups">
    <h1>Мои стартапы</h1>
    
    <div class="startups-grid">
      <div v-for="startup in startups" :key="startup.id" class="startup-card">
        <img :src="startup.image || '/placeholder.jpg'" :alt="startup.title" class="startup-image">
        <div class="startup-content">
          <h2>{{ startup.title }}</h2>
          <p class="description">{{ startup.description }}</p>
          
          <div class="stats">
            <div class="stat-item">
              <span class="label">Требуемые инвестиции:</span>
              <span class="value">{{ formatCurrency(startup.investmentNeeded) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Собрано:</span>
              <span class="value">{{ formatCurrency(startup.investmentCollected) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Ожидаемая ROI:</span>
              <span class="value">{{ startup.expectedRoi }}%</span>
            </div>
          </div>

          <div class="status-badge" :class="startup.status">
            {{ getStatusText(startup.status) }}
          </div>

          <div class="actions">
            <button @click="editStartup(startup.id)" class="btn btn-secondary">
              Редактировать
            </button>
            <button @click="viewDetails(startup.id)" class="btn btn-primary">
              Подробнее
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="startups.length === 0" class="empty-state">
      <p>У вас пока нет созданных стартапов</p>
      <router-link to="/startup/create" class="btn btn-primary">
        Создать стартап
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';

export default {
  name: 'MyStartups',
  setup() {
    const router = useRouter();
    const startups = ref([]);

    const fetchStartups = async () => {
      try {
        const response = await axios.get('/projects/author/me');
        startups.value = response.data;
      } catch (error) {
        console.error('Error fetching startups:', error);
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount);
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: 'На рассмотрении',
        active: 'Активный',
        completed: 'Завершен',
        cancelled: 'Отменен'
      };
      return statusMap[status] || status;
    };

    const editStartup = (id) => {
      router.push(`/startup/edit/${id}`);
    };

    const viewDetails = (id) => {
      router.push(`/startup/${id}`);
    };

    onMounted(fetchStartups);

    return {
      startups,
      formatCurrency,
      getStatusText,
      editStartup,
      viewDetails
    };
  }
};
</script>

<style scoped>
.my-startups {
  padding: 2rem;
}

.startups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.startup-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.startup-card:hover {
  transform: translateY(-5px);
}

.startup-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.startup-content {
  padding: 1.5rem;
}

.description {
  color: #666;
  margin: 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats {
  margin: 1rem 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #666;
}

.value {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  margin: 1rem 0;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background: #cce5ff;
  color: #004085;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  margin-top: 2rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1rem;
}
</style> 