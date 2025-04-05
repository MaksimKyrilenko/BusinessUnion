<template>
  <div class="investment-management">
    <h1>Управление инвестициями</h1>

    <div class="investment-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Общий портфель</div>
          <div class="stat-value">{{ formatCurrency(totalPortfolio) }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Средняя ROI</div>
          <div class="stat-value">{{ averageRoi }}%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Активные проекты</div>
          <div class="stat-value">{{ activeInvestments }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-coins"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Доход за период</div>
          <div class="stat-value">{{ formatCurrency(periodIncome) }}</div>
        </div>
      </div>
    </div>

    <div class="investment-filters">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск по проектам..."
          class="form-control"
        />
      </div>
      <div class="filter-options">
        <select v-model="statusFilter" class="form-control">
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="completed">Завершенные</option>
          <option value="pending">На рассмотрении</option>
        </select>
        <select v-model="sortBy" class="form-control">
          <option value="date">По дате</option>
          <option value="roi">По ROI</option>
          <option value="amount">По сумме</option>
        </select>
      </div>
    </div>

    <div class="investments-list">
      <div v-for="investment in filteredInvestments" :key="investment.id" class="investment-card">
        <div class="investment-header">
          <div class="project-info">
            <h3>{{ investment.project.title }}</h3>
            <span class="category">{{ investment.project.category.name }}</span>
          </div>
          <div class="investment-status" :class="investment.status">
            {{ getStatusText(investment.status) }}
          </div>
        </div>

        <div class="investment-details">
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Сумма инвестиции</span>
              <span class="value">{{ formatCurrency(investment.amount) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">ROI</span>
              <span class="value" :class="{ 'positive': investment.actualRoi > 0 }">
                {{ investment.actualRoi }}%
              </span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Дата инвестиции</span>
              <span class="value">{{ formatDate(investment.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Срок окупаемости</span>
              <span class="value">{{ calculatePaybackPeriod(investment) }}</span>
            </div>
          </div>
        </div>

        <div class="investment-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${(investment.actualRoi / investment.project.expectedRoi) * 100}%` }"
            ></div>
          </div>
          <div class="progress-labels">
            <span>Текущий ROI</span>
            <span>Ожидаемый ROI: {{ investment.project.expectedRoi }}%</span>
          </div>
        </div>

        <div class="investment-actions">
          <button 
            class="btn btn-primary"
            @click="viewProjectDetails(investment.project.id)"
          >
            Подробнее
          </button>
          <button 
            v-if="investment.status === 'active'"
            class="btn btn-success"
            @click="updateRoi(investment.id)"
          >
            Обновить ROI
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredInvestments.length === 0" class="no-investments">
      <i class="fas fa-folder-open"></i>
      <p>У вас пока нет инвестиций</p>
      <button class="btn btn-primary" @click="navigateToCatalog">
        Перейти в каталог стартапов
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';

export default {
  name: 'InvestmentManagement',
  setup() {
    const router = useRouter();
    const investments = ref([]);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const sortBy = ref('date');

    const totalPortfolio = computed(() => {
      return investments.value.reduce((sum, inv) => sum + inv.amount, 0);
    });

    const averageRoi = computed(() => {
      const activeInvestments = investments.value.filter(inv => inv.status === 'active');
      if (activeInvestments.length === 0) return 0;
      return Math.round(
        activeInvestments.reduce((sum, inv) => sum + inv.actualRoi, 0) / activeInvestments.length
      );
    });

    const activeInvestments = computed(() => {
      return investments.value.filter(inv => inv.status === 'active').length;
    });

    const periodIncome = computed(() => {
      return investments.value.reduce((sum, inv) => {
        if (inv.status === 'completed') {
          return sum + (inv.amount * (inv.actualRoi / 100));
        }
        return sum;
      }, 0);
    });

    const filteredInvestments = computed(() => {
      let filtered = [...investments.value];

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(inv => 
          inv.project.title.toLowerCase().includes(query) ||
          inv.project.category.name.toLowerCase().includes(query)
        );
      }

      if (statusFilter.value) {
        filtered = filtered.filter(inv => inv.status === statusFilter.value);
      }

      switch (sortBy.value) {
        case 'date':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'roi':
          filtered.sort((a, b) => b.actualRoi - a.actualRoi);
          break;
        case 'amount':
          filtered.sort((a, b) => b.amount - a.amount);
          break;
      }

      return filtered;
    });

    const fetchInvestments = async () => {
      try {
        const response = await axios.get('/investments/investor/me');
        investments.value = response.data;
      } catch (error) {
        console.error('Error fetching investments:', error);
      }
    };

    const getStatusText = (status) => {
      const statusMap = {
        active: 'Активная',
        completed: 'Завершена',
        pending: 'На рассмотрении'
      };
      return statusMap[status] || status;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const calculatePaybackPeriod = (investment) => {
      if (investment.actualRoi <= 0) return 'Не окупилось';
      const months = Math.ceil(100 / investment.actualRoi * 12);
      return `${months} мес.`;
    };

    const viewProjectDetails = (projectId) => {
      router.push(`/projects/${projectId}`);
    };

    const updateRoi = async (investmentId) => {
      try {
        await axios.post(`/investments/${investmentId}/roi`, {
          actualRoi: prompt('Введите новый ROI:')
        });
        await fetchInvestments();
      } catch (error) {
        console.error('Error updating ROI:', error);
      }
    };

    const navigateToCatalog = () => {
      router.push('/investor/startup-catalog');
    };

    onMounted(() => {
      fetchInvestments();
    });

    return {
      investments,
      searchQuery,
      statusFilter,
      sortBy,
      totalPortfolio,
      averageRoi,
      activeInvestments,
      periodIncome,
      filteredInvestments,
      getStatusText,
      formatCurrency,
      formatDate,
      calculatePaybackPeriod,
      viewProjectDetails,
      updateRoi,
      navigateToCatalog
    };
  }
};
</script>

<style scoped>
.investment-management {
  padding: 2rem;
}

.investment-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #007bff;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.investment-filters {
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

.investments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.investment-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.investment-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-info h3 {
  margin: 0;
  font-size: 1.25rem;
}

.category {
  color: #666;
  font-size: 0.875rem;
}

.investment-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.investment-status.active {
  background: #e3f2fd;
  color: #1976d2;
}

.investment-status.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.investment-status.pending {
  background: #fff3e0;
  color: #f57c00;
}

.investment-details {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  color: #666;
  font-size: 0.875rem;
}

.detail-item .value {
  font-weight: 600;
}

.detail-item .value.positive {
  color: #28a745;
}

.investment-progress {
  padding: 1.5rem;
  background: #f8f9fa;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.875rem;
}

.investment-actions {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.no-investments {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-investments i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.no-investments p {
  color: #666;
  margin-bottom: 1.5rem;
}
</style> 