<template>
  <div class="grants">
    <h1>Гранты для стартапов</h1>

    <div class="filters">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск грантов..."
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
          <option value="upcoming">Скоро начнутся</option>
          <option value="ended">Завершенные</option>
        </select>
      </div>
    </div>

    <div class="grants-grid">
      <div v-for="grant in filteredGrants" :key="grant.id" class="grant-card">
        <div class="grant-header">
          <h2>{{ grant.title }}</h2>
          <span class="status-badge" :class="grant.status">
            {{ getStatusText(grant.status) }}
          </span>
        </div>

        <div class="grant-content">
          <p class="description">{{ grant.description }}</p>
          
          <div class="grant-details">
            <div class="detail-item">
              <span class="label">Размер гранта:</span>
              <span class="value">{{ formatCurrency(grant.amount) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Срок подачи:</span>
              <span class="value">{{ formatDate(grant.deadline) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Требования:</span>
              <ul class="requirements-list">
                <li v-for="(req, index) in grant.requirements" :key="index">
                  {{ req }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="grant-footer">
          <button 
            @click="applyForGrant(grant.id)"
            class="btn btn-primary"
            :disabled="grant.status !== 'active'"
          >
            Подать заявку
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredGrants.length === 0" class="empty-state">
      <p>Гранты не найдены</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from '@/axios';

export default {
  name: 'Grants',
  setup() {
    const grants = ref([]);
    const categories = ref([]);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const selectedStatus = ref('');

    const fetchGrants = async () => {
      try {
        const response = await axios.get('/grants');
        grants.value = response.data;
      } catch (error) {
        console.error('Error fetching grants:', error);
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

    const filteredGrants = computed(() => {
      return grants.value.filter(grant => {
        const matchesSearch = grant.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            grant.description.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = !selectedCategory.value || grant.categoryId === selectedCategory.value;
        const matchesStatus = !selectedStatus.value || grant.status === selectedStatus.value;
        
        return matchesSearch && matchesCategory && matchesStatus;
      });
    });

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU');
    };

    const getStatusText = (status) => {
      const statusMap = {
        active: 'Активный',
        upcoming: 'Скоро начнется',
        ended: 'Завершен'
      };
      return statusMap[status] || status;
    };

    const applyForGrant = async (grantId) => {
      try {
        await axios.post(`/grants/${grantId}/apply`);
        // Показать уведомление об успешной подаче заявки
      } catch (error) {
        console.error('Error applying for grant:', error);
        // Показать уведомление об ошибке
      }
    };

    onMounted(() => {
      fetchGrants();
      fetchCategories();
    });

    return {
      grants,
      categories,
      searchQuery,
      selectedCategory,
      selectedStatus,
      filteredGrants,
      formatCurrency,
      formatDate,
      getStatusText,
      applyForGrant
    };
  }
};
</script>

<style scoped>
.grants {
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

.grants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.grant-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grant-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grant-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.grant-content {
  padding: 1.5rem;
}

.description {
  color: #666;
  margin-bottom: 1rem;
}

.grant-details {
  margin-top: 1rem;
}

.detail-item {
  margin-bottom: 1rem;
}

.label {
  color: #666;
  display: block;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: 600;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

.requirements-list li {
  padding: 0.25rem 0;
  color: #666;
}

.grant-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.upcoming {
  background: #cce5ff;
  color: #004085;
}

.status-badge.ended {
  background: #f8d7da;
  color: #721c24;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:disabled {
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