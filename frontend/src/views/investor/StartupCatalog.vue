<template>
  <div class="startup-catalog">
    <h1>Каталог стартапов</h1>

    <div class="filters">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск стартапов..."
          class="form-control"
        />
      </div>
      <div class="filter-options">
        <select v-model="selectedCategory" class="form-control">
          <option value="">Все категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select v-model="selectedStatus" class="form-control">
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="pending">На рассмотрении</option>
          <option value="completed">Завершенные</option>
        </select>
        <select v-model="sortBy" class="form-control">
          <option value="roi">По ROI</option>
          <option value="amount">По сумме инвестиций</option>
          <option value="date">По дате</option>
        </select>
      </div>
    </div>

    <div class="startups-grid">
      <div v-for="startup in filteredStartups" :key="startup.id" class="startup-card">
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
            <div class="stat-item">
              <span class="label">Осталось собрать:</span>
              <span class="value">{{ formatCurrency(startup.investmentNeeded - startup.investmentCollected) }}</span>
            </div>
          </div>

          <div class="progress-bar">
            <div 
              class="progress"
              :style="{ width: `${(startup.investmentCollected / startup.investmentNeeded) * 100}%` }"
            ></div>
          </div>

          <div class="status-badge" :class="startup.status">
            {{ getStatusText(startup.status) }}
          </div>

          <div class="actions">
            <button @click="viewDetails(startup.id)" class="btn btn-primary">
              Подробнее
            </button>
            <button 
              @click="invest(startup.id)"
              class="btn btn-success"
              :disabled="startup.status !== 'active'"
            >
              Инвестировать
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredStartups.length === 0" class="empty-state">
      <p>Стартапы не найдены</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';

export default {
  name: 'StartupCatalog',
  setup() {
    const router = useRouter();
    const startups = ref([]);
    const categories = ref([]);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const selectedStatus = ref('');
    const sortBy = ref('roi');

    const fetchStartups = async () => {
      try {
        const response = await axios.get('/projects');
        startups.value = response.data;
      } catch (error) {
        console.error('Error fetching startups:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        categories.value = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const filteredStartups = computed(() => {
      let filtered = startups.value.filter(startup => {
        const matchesSearch = startup.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            startup.description.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = !selectedCategory.value || startup.category.id === selectedCategory.value;
        const matchesStatus = !selectedStatus.value || startup.status === selectedStatus.value;
        
        return matchesSearch && matchesCategory && matchesStatus;
      });

      // Сортировка
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'roi':
            return b.expectedRoi - a.expectedRoi;
          case 'amount':
            return b.investmentNeeded - a.investmentNeeded;
          case 'date':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });

      return filtered;
    });

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

    const viewDetails = (id) => {
      router.push(`/startup/${id}`);
    };

    const invest = (id) => {
      router.push(`/startup/${id}/invest`);
    };

    onMounted(() => {
      fetchStartups();
      fetchCategories();
    });

    return {
      startups,
      categories,
      searchQuery,
      selectedCategory,
      selectedStatus,
      sortBy,
      filteredStartups,
      formatCurrency,
      getStatusText,
      viewDetails,
      invest
    };
  }
};
</script>

<style scoped>
.startup-catalog {
  padding: 2rem;
}

.filters {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.startups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  margin: 0;
}
</style> 