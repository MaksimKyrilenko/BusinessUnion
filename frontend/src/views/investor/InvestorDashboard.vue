<template>
  <div class="investor-dashboard">
    <h1>Панель инвестора</h1>
    
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>
    
    <div v-else class="dashboard-content">
      <!-- Блок с ключевыми статистиками -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon investments-icon">
            <i class="fas fa-coins"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ formatMoney(totalInvested) }}</div>
            <div class="stat-label">Всего инвестировано</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon projects-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ investments.length }}</div>
            <div class="stat-label">Проектов в портфеле</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon roi-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ averageRoi }}%</div>
            <div class="stat-label">Средний ROI</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon status-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-details">
            <div class="stat-value">{{ activeCount }}</div>
            <div class="stat-label">Активных проектов</div>
          </div>
        </div>
      </div>
      
      <!-- Блок с портфелем инвестиций -->
      <div class="portfolio-section">
        <div class="section-header">
          <h2>Инвестиционный портфель</h2>
          <BaseButton 
            variant="outlined"
            @click="router.push('/startups')"
          >
            Найти проекты
          </BaseButton>
        </div>
        
        <div v-if="investments.length === 0" class="empty-state">
          <p>У вас пока нет инвестиций</p>
          <BaseButton 
            variant="primary" 
            @click="router.push('/startups')"
          >
            Изучить стартапы
          </BaseButton>
        </div>
        
        <div v-else class="portfolio-grid">
          <div 
            v-for="investment in investments" 
            :key="investment.id" 
            class="investment-card"
          >
            <div class="investment-header">
              <div class="project-image">
                <img 
                  :src="investment.project.image || '/assets/images/placeholder-project.jpg'" 
                  :alt="investment.project.title"
                >
              </div>
              <div class="project-info">
                <h3>{{ investment.project.title }}</h3>
                <div class="project-meta">
                  <span 
                    class="project-stage" 
                    :class="investment.project.stage"
                  >
                    {{ getStageText(investment.project.stage) }}
                  </span>
                  <span class="project-category" v-if="investment.project.category">
                    {{ investment.project.category.name }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="investment-details">
              <div class="detail-row">
                <span class="detail-label">Сумма инвестиции:</span>
                <span class="detail-value">{{ formatMoney(investment.amount) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Дата инвестиции:</span>
                <span class="detail-value">{{ formatDate(investment.createdAt) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Ожидаемый ROI:</span>
                <span class="detail-value roi">{{ investment.project.expectedRoi }}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Статус:</span>
                <span 
                  class="detail-value status" 
                  :class="investment.project.status"
                >
                  {{ getStatusText(investment.project.status) }}
                </span>
              </div>
            </div>
            
            <div class="investment-actions">
              <BaseButton 
                variant="outlined" 
                size="small"
                @click="viewProjectDetails(investment.project.id)"
              >
                Подробнее
              </BaseButton>
              <BaseButton 
                variant="outlined" 
                size="small"
                @click="contactFounder(investment.project.id, investment.project.ownerId)"
              >
                Связаться
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Блок с графиком распределения портфеля -->
      <div class="portfolio-distribution">
        <h2>Распределение портфеля</h2>
        
        <div class="distribution-grid">
          <div class="distribution-chart">
            <div class="chart-placeholder">
              <div class="pie-segment" v-for="(segment, index) in portfolioSegments" :key="index" 
                   :style="{ 
                     backgroundColor: segment.color, 
                     width: '80px', 
                     height: '80px', 
                     transform: `rotate(${segment.rotation}deg)`
                   }">
              </div>
              <div class="chart-label">По категориям</div>
            </div>
          </div>
          
          <div class="distribution-legend">
            <div v-for="(segment, index) in portfolioSegments" :key="index" class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
              <div class="legend-text">
                <div class="legend-label">{{ segment.name }}</div>
                <div class="legend-value">{{ formatMoney(segment.value) }} ({{ Math.round(segment.percentage) }}%)</div>
              </div>
            </div>
          </div>
          
          <div class="distribution-table">
            <table>
              <thead>
                <tr>
                  <th>Категория</th>
                  <th>Сумма</th>
                  <th>Доля</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(segment, index) in portfolioSegments" :key="index">
                  <td>{{ segment.name }}</td>
                  <td>{{ formatMoney(segment.value) }}</td>
                  <td>{{ Math.round(segment.percentage) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Блок с рекомендациями -->
      <div class="recommendations-section">
        <h2>Рекомендуемые проекты</h2>
        
        <div v-if="recommendedProjects.length === 0" class="empty-state">
          <p>Пока нет персональных рекомендаций</p>
        </div>
        
        <div v-else class="recommendations-grid">
          <div 
            v-for="project in recommendedProjects" 
            :key="project.id" 
            class="recommended-card"
            @click="viewProjectDetails(project.id)"
          >
            <div class="project-image">
              <img 
                :src="project.image || '/assets/images/placeholder-project.jpg'" 
                :alt="project.title"
              >
            </div>
            <div class="project-info">
              <h3>{{ project.title }}</h3>
              <p>{{ project.description }}</p>
              <div class="project-stats">
                <div class="project-stat">
                  <span class="stat-label">Инвестиции:</span>
                  <span class="stat-value">{{ formatMoney(project.investmentNeeded) }}</span>
                </div>
                <div class="project-stat">
                  <span class="stat-label">ROI:</span>
                  <span class="stat-value">{{ project.expectedRoi }}%</span>
                </div>
              </div>
              <div class="project-meta">
                <span class="project-stage" :class="project.stage">
                  {{ getStageText(project.stage) }}
                </span>
                <span class="project-category" v-if="project.category">
                  {{ project.category.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для отправки сообщения -->
    <BaseModal v-model="showContactModal" title="Связаться с основателем">
      <form @submit.prevent="sendMessage">
        <div class="form-group">
          <label for="message">Сообщение</label>
          <textarea 
            id="message" 
            v-model="contactMessage" 
            rows="5" 
            placeholder="Введите ваше сообщение"
            required
          ></textarea>
        </div>
        <div class="modal-actions">
          <BaseButton variant="text" @click="showContactModal = false">
            Отмена
          </BaseButton>
          <BaseButton 
            type="submit" 
            variant="primary"
            :loading="sendingMessage"
          >
            Отправить
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { projectsService } from '@/services/projects.service';
import { chatService } from '@/services/chat.service';

export default {
  name: 'InvestorDashboard',
  components: {
    BaseButton,
    BaseModal
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const investments = ref([]);
    const recommendedProjects = ref([]);
    
    // Состояние для модального окна
    const showContactModal = ref(false);
    const contactMessage = ref('');
    const currentFounderId = ref(null);
    const currentProjectId = ref(null);
    const sendingMessage = ref(false);
    
    // Вычисляемые свойства
    const totalInvested = computed(() => {
      return investments.value.reduce((sum, inv) => sum + inv.amount, 0);
    });
    
    const averageRoi = computed(() => {
      if (investments.value.length === 0) return 0;
      
      const total = investments.value.reduce((sum, inv) => {
        return sum + (inv.project.expectedRoi || 0);
      }, 0);
      
      return Math.round(total / investments.value.length);
    });
    
    const activeCount = computed(() => {
      return investments.value.filter(inv => 
        inv.project.status === 'active' || 
        inv.project.status === 'funded'
      ).length;
    });
    
    const portfolioSegments = computed(() => {
      const categories = {};
      
      // Группируем инвестиции по категориям
      investments.value.forEach(inv => {
        const categoryName = inv.project.category ? inv.project.category.name : 'Другое';
        
        if (!categories[categoryName]) {
          categories[categoryName] = 0;
        }
        
        categories[categoryName] += inv.amount;
      });
      
      // Преобразуем в массив для отображения
      const segments = [];
      let startAngle = 0;
      
      Object.entries(categories).forEach(([name, value], index) => {
        const percentage = (value / totalInvested.value) * 100;
        
        segments.push({
          name, 
          value,
          percentage,
          color: getCategoryColor(index),
          rotation: startAngle
        });
        
        startAngle += (percentage / 100) * 360;
      });
      
      return segments.sort((a, b) => b.value - a.value);
    });
    
    // Методы
    const fetchInvestments = async () => {
      try {
        const data = await projectsService.getMyInvestments();
        console.log('Получены инвестиции:', data);
        investments.value = data;
      } catch (error) {
        console.error('Ошибка при получении инвестиций:', error);
      }
    };
    
    const fetchRecommendations = async () => {
      try {
        // В реальном приложении здесь будет отдельный API для рекомендаций
        // Временно берем случайные проекты из общего списка
        const projects = await projectsService.getAllProjects();
        const invested = new Set(investments.value.map(inv => inv.project.id));
        
        // Отфильтровываем проекты, в которые уже инвестировали
        const available = projects.filter(p => !invested.has(p.id));
        
        // Берем первые 3 проекта как рекомендации
        recommendedProjects.value = available.slice(0, 3);
        console.log('Получены рекомендации:', recommendedProjects.value);
      } catch (error) {
        console.error('Ошибка при получении рекомендаций:', error);
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
    
    const getStageText = (stage) => {
      const stageMap = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      };
      
      return stageMap[stage] || 'Неизвестно';
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
    
    const viewProjectDetails = (projectId) => {
      router.push(`/startups/${projectId}`);
    };
    
    const contactFounder = (projectId, founderId) => {
      currentProjectId.value = projectId;
      currentFounderId.value = founderId;
      contactMessage.value = '';
      showContactModal.value = true;
    };
    
    const sendMessage = async () => {
      if (!contactMessage.value.trim() || !currentFounderId.value) return;
      
      sendingMessage.value = true;
      try {
        await chatService.sendMessage({
          recipientId: currentFounderId.value,
          content: contactMessage.value,
          projectId: currentProjectId.value
        });
        
        showContactModal.value = false;
        alert('Сообщение отправлено!');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Не удалось отправить сообщение. Пожалуйста, попробуйте позже.');
      } finally {
        sendingMessage.value = false;
      }
    };
    
    // Загрузка данных при монтировании компонента
    onMounted(async () => {
      loading.value = true;
      try {
        await Promise.all([
          fetchInvestments(),
          fetchRecommendations()
        ]);
      } finally {
        loading.value = false;
      }
    });
    
    return {
      router,
      loading,
      investments,
      recommendedProjects,
      showContactModal,
      contactMessage,
      sendingMessage,
      totalInvested,
      averageRoi,
      activeCount,
      portfolioSegments,
      formatMoney,
      formatDate,
      getStageText,
      getStatusText,
      viewProjectDetails,
      contactFounder,
      sendMessage
    };
  }
};
</script>

<style scoped>
.investor-dashboard {
  padding: 20px;
}

.investor-dashboard h1 {
  margin-bottom: 24px;
  font-size: 32px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  color: white;
}

.investments-icon {
  background-color: #2196F3;
}

.projects-icon {
  background-color: #4CAF50;
}

.roi-icon {
  background-color: #FFC107;
}

.status-icon {
  background-color: #9C27B0;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.portfolio-section, .portfolio-distribution, .recommendations-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

.empty-state p {
  margin-bottom: 16px;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.investment-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.investment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.investment-header {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.project-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 16px;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-info h3 {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.project-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.project-stage, .project-category {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.project-stage {
  background-color: #e3f2fd;
  color: #1976d2;
}

.project-stage.idea {
  background-color: #e3f2fd;
  color: #1976d2;
}

.project-stage.mvp {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.project-stage.growth {
  background-color: #fff3e0;
  color: #e65100;
}

.project-stage.scaling {
  background-color: #fce4ec;
  color: #c2185b;
}

.project-category {
  background-color: #f5f5f5;
  color: #616161;
}

.investment-details {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #6c757d;
}

.detail-value {
  font-weight: 500;
}

.detail-value.roi {
  color: #4caf50;
}

.detail-value.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status.funded {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status.completed {
  background-color: #f5f5f5;
  color: #616161;
}

.status.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status.rejected {
  background-color: #ffebee;
  color: #c62828;
}

.investment-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: auto 1fr 1.5fr;
  gap: 24px;
  align-items: center;
}

.chart-placeholder {
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
  transform-origin: bottom right;
  border-radius: 80px 0 0 0;
}

.chart-label {
  position: absolute;
  font-size: 12px;
  color: #343a40;
  text-align: center;
  z-index: 2;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 12px;
}

.distribution-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
}

.legend-label {
  font-weight: 500;
  margin-right: 8px;
}

.legend-value {
  color: #6c757d;
}

.distribution-table {
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
  background-color: #f8f9fa;
  font-weight: 500;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recommended-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recommended-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.recommended-card .project-image {
  width: 100%;
  height: 150px;
  margin-right: 0;
}

.recommended-card .project-info {
  padding: 16px;
}

.recommended-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.recommended-card p {
  color: #6c757d;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-stat .stat-label {
  font-size: 12px;
  color: #6c757d;
  display: block;
  margin-bottom: 2px;
}

.project-stat .stat-value {
  font-size: 14px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .distribution-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .chart-placeholder {
    margin: 0 auto;
  }
  
  .distribution-legend {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style> 