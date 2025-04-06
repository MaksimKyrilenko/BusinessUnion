<template>
  <div class="my-startups">
    <div class="header">
      <h1>Мои стартапы</h1>
      <BaseButton @click="createStartup" variant="primary">
        Создать стартап
      </BaseButton>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка стартапов...</p>
    </div>

    <div v-else-if="startups.length === 0" class="empty-state">
      <p>У вас пока нет созданных стартапов</p>
      <BaseButton @click="createStartup" variant="primary">
        Создать первый стартап
      </BaseButton>
    </div>

    <div v-else class="startups-grid">
      <div v-for="startup in startups" :key="startup.id" class="startup-card">
        <div class="startup-image">
          <img :src="startup.imageUrl || '/assets/images/placeholder-project.jpg'" :alt="startup.title">
        </div>
        <div class="startup-content">
          <h3>{{ startup.title }}</h3>
          <p class="description">{{ startup.description }}</p>
          <div class="startup-meta">
            <span class="stage">{{ getStageText(startup.stage) }}</span>
            <span class="investment">{{ formatMoney(startup.investmentAmount) }}</span>
          </div>
          <div class="startup-actions">
            <BaseButton @click="viewDetails(startup.id)" variant="secondary" size="small">
              Подробнее
            </BaseButton>
            <BaseButton @click="editStartup(startup.id)" variant="primary" size="small">
              Редактировать
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { projectsService } from '@/services/projects.service';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const startups = ref([]);
const loading = ref(true);

const fetchStartups = async () => {
  try {
    loading.value = true;
    const response = await projectsService.getMyProjects();
    console.log('Полученные проекты:', response);
    startups.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Ошибка при загрузке стартапов:', error);
    startups.value = [];
  } finally {
    loading.value = false;
  }
};

const createStartup = () => {
  router.push('/startups/create');
};

const viewDetails = (id) => {
  router.push(`/startups/${id}`);
};

const editStartup = (id) => {
  router.push(`/startups/edit/${id}`);
};

const formatMoney = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
};

const getStageText = (stage) => {
  const stages = {
    IDEA: 'Идея',
    MVP: 'MVP',
    GROWTH: 'Рост',
    SCALING: 'Масштабирование'
  };
  return stages[stage] || stage;
};

onMounted(() => {
  fetchStartups();
});
</script>

<style scoped>
.my-startups {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.startups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.startup-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.startup-card:hover {
  transform: translateY(-4px);
}

.startup-image {
  height: 200px;
  overflow: hidden;
}

.startup-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.startup-content {
  padding: 1.5rem;
}

.startup-content h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.startup-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.stage {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.investment {
  color: #28a745;
}

.startup-actions {
  display: flex;
  gap: 0.5rem;
}
</style> 