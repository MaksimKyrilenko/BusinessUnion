<template>
  <div class="startup-analysis">
    <h1>Аналитика инвестиций</h1>

    <div class="dashboard-grid">
      <!-- Статистика инвестиций -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Инвестиционный портфель</h2>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>Загрузка данных...</p>
          </div>
          <div v-else-if="myInvestments.length === 0" class="empty-state">
            <p>У вас пока нет инвестиций</p>
            <BaseButton 
              variant="primary" 
              @click="goToStartupCatalog"
            >
              Перейти в каталог стартапов
            </BaseButton>
          </div>
          <div v-else>
            <div class="investments-stats">
              <div class="stat-item">
                <div class="stat-value">{{ formatMoney(totalInvested) }}</div>
                <div class="stat-label">Общий объем инвестиций</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ myInvestments.length }}</div>
                <div class="stat-label">Количество проектов</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ avgRoi }}%</div>
                <div class="stat-label">Средний ROI</div>
              </div>
            </div>
            
            <h3>Мои инвестиции</h3>
            <div class="investments-list">
              <div 
                v-for="investment in myInvestments" 
                :key="investment.id" 
                class="investment-item"
              >
                <div class="investment-details">
                  <div class="investment-project">
                    <div class="project-name">{{ investment.project.title }}</div>
                    <div class="project-stage">{{ getStageText(investment.project.stage) }}</div>
                  </div>
                  <div class="investment-amount">
                    {{ formatMoney(investment.amount) }}
                  </div>
                </div>
                <div class="investment-footer">
                  <div class="investment-date">
                    Инвестировано: {{ formatDate(investment.createdAt) }}
                  </div>
                  <button class="view-btn" @click="viewProject(investment.project.id)">
                    Просмотр
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Рекомендации по инвестициям -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Рекомендуемые проекты</h2>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>Загрузка рекомендаций...</p>
          </div>
          <div v-else-if="recommendedProjects.length === 0" class="empty-state">
            <p>Пока нет рекомендаций</p>
          </div>
          <div v-else class="recommendations">
            <div 
              v-for="project in recommendedProjects" 
              :key="project.id" 
              class="recommended-project"
            >
              <div class="project-image">
                <img :src="project.image || '/assets/images/placeholder-project.jpg'" :alt="project.title">
              </div>
              <div class="project-info">
                <div class="project-title">{{ project.title }}</div>
                <div class="project-meta">
                  <span class="project-category" v-if="project.category">{{ project.category.name }}</span>
                  <span class="project-stage">{{ getStageText(project.stage) }}</span>
                </div>
                <div class="project-metrics">
                  <div class="metric">
                    <div class="metric-label">Инвестиции</div>
                    <div class="metric-value">{{ formatMoney(project.investmentNeeded) }}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">ROI</div>
                    <div class="metric-value">{{ project.expectedRoi }}%</div>
                  </div>
                </div>
                <div class="project-actions">
                  <BaseButton 
                    variant="primary" 
                    size="small"
                    @click="viewProject(project.id)"
                  >
                    Подробнее
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Диаграмма распределения инвестиций -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Распределение инвестиций</h2>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>Загрузка диаграммы...</p>
          </div>
          <div v-else-if="myInvestments.length === 0" class="empty-state">
            <p>Нет данных для отображения</p>
          </div>
          <div v-else class="chart-container">
            <div class="pie-chart-placeholder">
              <div class="pie-segment" v-for="(segment, index) in pieChartData" :key="index" 
                   :style="{ 
                     backgroundColor: segment.color, 
                     width: '80px', 
                     height: '80px', 
                     transform: `rotate(${segment.rotation}deg)`
                   }">
              </div>
              <div class="pie-label">Инвестиции по категориям</div>
            </div>
            <div class="pie-legend">
              <div v-for="(category, index) in investmentsByCategory" :key="index" class="legend-item">
                <div class="legend-color" :style="{ backgroundColor: getCategoryColor(index) }"></div>
                <div class="legend-text">
                  <div class="legend-label">{{ category.name }}</div>
                  <div class="legend-value">{{ formatMoney(category.amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица доходности -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>Доходность проектов</h2>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>Загрузка данных...</p>
          </div>
          <div v-else-if="myInvestments.length === 0" class="empty-state">
            <p>Нет данных для отображения</p>
          </div>
          <div v-else class="roi-table">
            <table>
              <thead>
                <tr>
                  <th>Проект</th>
                  <th>Инвестиции</th>
                  <th>Ожидаемая ROI</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="investment in myInvestments" :key="investment.id">
                  <td>{{ investment.project.title }}</td>
                  <td>{{ formatMoney(investment.amount) }}</td>
                  <td>{{ investment.project.expectedRoi }}%</td>
                  <td>{{ getStatusText(investment.project.status) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import { projectsService } from '@/services/projects.service';

export default {
  name: 'StartupAnalysis',
  components: {
    BaseButton
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const myInvestments = ref([]);
    const recommendedProjects = ref([]);

    // Вычисляемые свойства
    const totalInvested = computed(() => {
      return myInvestments.value.reduce((sum, investment) => sum + investment.amount, 0);
    });

    const avgRoi = computed(() => {
      if (myInvestments.value.length === 0) return 0;
      
      const totalRoi = myInvestments.value.reduce((sum, investment) => {
        return sum + (investment.project.expectedRoi || 0);
      }, 0);
      
      return Math.round(totalRoi / myInvestments.value.length);
    });

    const investmentsByCategory = computed(() => {
      const categories = {};
      
      myInvestments.value.forEach(investment => {
        const categoryName = investment.project.category?.name || 'Другое';
        if (!categories[categoryName]) {
          categories[categoryName] = {
            name: categoryName,
            amount: 0
          };
        }
        categories[categoryName].amount += investment.amount;
      });
      
      return Object.values(categories).sort((a, b) => b.amount - a.amount);
    });
    
    const pieChartData = computed(() => {
      const data = [];
      let startAngle = 0;
      
      investmentsByCategory.value.forEach((category, index) => {
        const percentage = (category.amount / totalInvested.value) * 100;
        const angle = (percentage / 100) * 360;
        
        data.push({
          name: category.name,
          value: category.amount,
          percentage,
          color: getCategoryColor(index),
          rotation: startAngle
        });
        
        startAngle += angle;
      });
      
      return data;
    });

    // Методы
    const fetchMyInvestments = async () => {
      try {
        const response = await projectsService.getMyInvestments();
        console.log('Получены инвестиции:', response);
        myInvestments.value = response;
      } catch (error) {
        console.error('Ошибка при получении инвестиций:', error);
      }
    };

    const fetchRecommendedProjects = async () => {
      try {
        // В реальном приложении здесь должен быть вызов API для получения рекомендаций
        // Пока используем имитацию, беря первые 3 проекта из общего списка
        const response = await projectsService.getAllProjects();
        recommendedProjects.value = response.slice(0, 3);
        console.log('Получены рекомендуемые проекты:', recommendedProjects.value);
      } catch (error) {
        console.error('Ошибка при получении рекомендуемых проектов:', error);
      }
    };

    const formatMoney = (amount) => {
      if (!amount) return '0 ₽';
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: 'На рассмотрении',
        active: 'Активный',
        funded: 'Финансируется',
        completed: 'Завершен',
        rejected: 'Отклонен'
      };
      
      return statusMap[status] || 'Неизвестно';
    };

    const getStageText = (stage) => {
      const stageMap = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      };
      
      return stageMap[stage] || 'Неизвестно';
    };

    const getCategoryColor = (index) => {
      const colors = [
        '#2196F3', // Синий
        '#4CAF50', // Зеленый
        '#FFC107', // Желтый
        '#9C27B0', // Фиолетовый
        '#E91E63', // Розовый
        '#FF5722', // Оранжевый
        '#607D8B'  // Серый
      ];
      
      return colors[index % colors.length];
    };

    const viewProject = (id) => {
      router.push(`/startups/${id}`);
    };

    const goToStartupCatalog = () => {
      router.push('/startups');
    };

    // Загрузка данных при монтировании компонента
    onMounted(async () => {
      loading.value = true;
      try {
        await Promise.all([
          fetchMyInvestments(),
          fetchRecommendedProjects()
        ]);
      } finally {
        loading.value = false;
      }
    });

    return {
      loading,
      myInvestments,
      recommendedProjects,
      totalInvested,
      avgRoi,
      investmentsByCategory,
      pieChartData,
      formatMoney,
      formatDate,
      getStatusText,
      getStageText,
      getCategoryColor,
      viewProject,
      goToStartupCatalog
    };
  }
};
</script>

<style scoped>
.startup-analysis {
  padding: 20px;
}

.startup-analysis h1 {
  margin-bottom: 24px;
  font-size: 32px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #212529;
}

.card-content {
  padding: 20px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #6c757d;
}

.empty-state p {
  margin-bottom: 16px;
}

.investments-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #2196F3;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #343a40;
}

.investments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.investment-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.investment-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.project-stage {
  font-size: 12px;
  color: #6c757d;
}

.investment-amount {
  font-weight: 600;
  color: #2196F3;
}

.investment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6c757d;
}

.view-btn {
  background: none;
  border: none;
  color: #2196F3;
  font-size: 12px;
  cursor: pointer;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommended-project {
  display: flex;
  gap: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.project-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-info {
  flex: 1;
}

.project-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.project-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.project-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 2px;
}

.metric-value {
  font-weight: 500;
  font-size: 14px;
}

.chart-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pie-chart-placeholder {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  background: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  transform-origin: bottom right;
  border-radius: 80px 0 0 0;
}

.pie-label {
  position: absolute;
  font-size: 12px;
  color: #fff;
  text-align: center;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.pie-legend {
  flex: 1;
  margin-left: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
}

.legend-text {
  flex: 1;
}

.legend-label {
  font-size: 14px;
}

.legend-value {
  font-size: 12px;
  color: #6c757d;
}

.roi-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  font-weight: 500;
  color: #495057;
  background-color: #f8f9fa;
}

tr:hover {
  background-color: #f1f3f5;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pie-legend {
    margin-left: 0;
    margin-top: 20px;
    width: 100%;
  }
}
</style> 