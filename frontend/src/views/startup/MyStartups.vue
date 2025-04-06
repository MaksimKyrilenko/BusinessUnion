<template>
  <div class="my-startups">
    <div class="header-container">
      <h1>Мои стартапы</h1>
      <button @click="createNewStartup" class="create-btn">
        <i class="fas fa-plus"></i>
        Создать стартап
      </button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка стартапов...</p>
    </div>
    
    <div v-else-if="startups.length === 0" class="empty-state">
      <p>У вас пока нет созданных стартапов</p>
      <button @click="createNewStartup" class="btn btn-primary">
        Создать стартап
      </button>
    </div>
    
    <div v-else class="startups-grid">
      <div v-for="startup in startups" :key="startup.id" class="startup-card">
        <div class="startup-image">
          <img :src="startup.image || '/placeholder.jpg'" :alt="startup.title" class="image">
          <div class="stage-badge">{{ getStageText(startup.stage) }}</div>
        </div>
        
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
              <span class="value">{{ formatCurrency(startup.investmentCollected || 0) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Ожидаемая ROI:</span>
              <span class="value">{{ startup.expectedRoi }}%</span>
            </div>
            <div class="stat-item" v-if="startup.location">
              <span class="label">Местоположение:</span>
              <span class="value">{{ startup.location }}</span>
            </div>
          </div>

          <div class="status-badge" :class="startup.status">
            {{ getStatusText(startup.status) }}
          </div>

          <div class="actions">
            <button @click="editStartup(startup.id)" class="btn btn-secondary">
              <i class="fas fa-edit"></i>
              Редактировать
            </button>
            <button @click="viewDetails(startup.id)" class="btn btn-primary">
              <i class="fas fa-eye"></i>
              Подробнее
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { projectsService } from '@/services/projects.service';

export default {
  name: 'MyStartups',
  setup() {
    const router = useRouter();
    const startups = ref([]);
    const loading = ref(false);

    const fetchStartups = async () => {
      loading.value = true;
      try {
        const response = await projectsService.getMyProjects();
        console.log('Получены стартапы:', response);
        startups.value = response;
      } catch (error) {
        console.error('Ошибка при получении стартапов:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
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

    const getStageText = (stage) => {
      const stageMap = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      };
      return stageMap[stage] || stage;
    };

    const editStartup = (id) => {
      router.push(`/startup/edit/${id}`);
    };

    const viewDetails = (id) => {
      router.push(`/startups/${id}`);
    };

    const createNewStartup = () => {
      router.push('/startup/create');
    };

    onMounted(fetchStartups);

    return {
      startups,
      loading,
      formatCurrency,
      getStatusText,
      getStageText,
      editStartup,
      viewDetails,
      createNewStartup
    };
  }
};
</script>

<style scoped>
.my-startups {
  padding: 2rem;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-btn {
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
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
  position: relative;
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
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

.loading-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  margin-top: 2rem;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 