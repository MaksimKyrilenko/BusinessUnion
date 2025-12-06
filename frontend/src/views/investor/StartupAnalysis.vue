<template>
  <div class="startup-analysis">
    <h1>Аналитика инвестиций</h1>

    <div class="dashboard-grid">
      <!-- Анализ стартапа через Yandex Cloud AI -->
      <div class="dashboard-card analysis-card full-width">
        <div class="card-header">
          <h2>Анализ стартапа</h2>
        </div>
        <div class="card-content">
          <div class="analysis-section">
            <div class="analysis-selector">
              <label for="startup-select">Выберите стартап для анализа:</label>
              <div class="analysis-controls">
                <select 
                  id="startup-select" 
                  v-model="selectedStartupForAnalysis" 
                  class="startup-select"
                  :disabled="analyzing || availableStartups.length === 0"
                >
                  <option value="">-- Выберите стартап --</option>
                  <option 
                    v-for="startup in availableStartups" 
                    :key="startup.id" 
                    :value="startup.id"
                  >
                    {{ startup.title }} ({{ getStageText(startup.stage) }})
                  </option>
                </select>
                <BaseButton 
                  variant="primary" 
                  @click="analyzeSelectedStartup"
                  :disabled="!selectedStartupForAnalysis || analyzing"
                  :loading="analyzing"
                  class="analyze-btn"
                >
                  {{ analyzing ? 'Анализирую...' : 'Проанализировать' }}
                </BaseButton>
              </div>
            </div>

            <div v-if="parsedAnalysis.length > 0" class="analysis-result-container">
              <h3 class="analysis-title">Результат анализа</h3>
              <div class="analysis-blocks-grid">
                <div 
                  v-for="(section, index) in parsedAnalysis" 
                  :key="index"
                  class="analysis-block-card"
                  :class="{ 'full-width-block': section.number === 5 }"
                >
                  <div class="block-header">
                    <div class="block-number">{{ section.number }}</div>
                    <h4 class="block-title">{{ section.title }}</h4>
                  </div>
                  <div class="block-content">
                    <div 
                      v-for="(item, itemIndex) in section.items" 
                      :key="itemIndex"
                      class="block-item"
                    >
                      <div v-if="item.type === 'paragraph'" class="item-paragraph">
                        <strong v-if="item.label">{{ item.label }}</strong>
                        <span v-if="item.text">{{ item.text }}</span>
                      </div>
                      <div v-if="item.type === 'list'" class="item-list">
                        <strong v-if="item.label" class="list-label">{{ item.label }}</strong>
                        <ul class="analysis-list">
                          <li v-for="(listItem, listIndex) in item.items" :key="listIndex" class="analysis-list-item">
                            {{ listItem }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="analysisError" class="analysis-error">
              <p><i class="fas fa-exclamation-circle"></i> {{ analysisError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Рекомендации по инвестициям -->
      <div class="dashboard-card recommendations-card full-width">
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
          <div v-else class="recommendations-grid">
            <div 
              v-for="project in recommendedProjects" 
              :key="project.id" 
              class="recommended-project"
            >
              <div class="project-image">
                <img 
                  :src="getImageSrc(project.image)" 
                  :alt="project.title"
                  @error="handleImageError"
                >
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
    const availableStartups = ref([]);
    const selectedStartupForAnalysis = ref('');
    const analyzing = ref(false);
    const analysisResult = ref('');
    const analysisError = ref('');
    const parsedAnalysis = ref([]);

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
        // Пока используем имитацию, беря первые 6 проектов из общего списка
        const response = await projectsService.getAllProjects();
        recommendedProjects.value = response.slice(0, 6);
        console.log('Получены рекомендуемые проекты:', recommendedProjects.value);
      } catch (error) {
        console.error('Ошибка при получении рекомендуемых проектов:', error);
      }
    };

    const fetchAvailableStartups = async () => {
      try {
        const response = await projectsService.getAllProjects();
        availableStartups.value = response;
        console.log('Получены стартапы для анализа:', availableStartups.value.length);
      } catch (error) {
        console.error('Ошибка при получении стартапов:', error);
      }
    };

    const analyzeSelectedStartup = async () => {
      if (!selectedStartupForAnalysis.value) {
        analysisError.value = 'Пожалуйста, выберите стартап для анализа';
        return;
      }

      analyzing.value = true;
      analysisError.value = '';
      analysisResult.value = '';

      try {
        const result = await projectsService.analyzeStartup(selectedStartupForAnalysis.value);
        analysisResult.value = result;
        parseAnalysisResult(result);
        console.log('Анализ получен:', result);
      } catch (error) {
        console.error('Ошибка при анализе стартапа:', error);
        analysisError.value = error.response?.data?.message || error.message || 'Не удалось проанализировать стартап';
        parsedAnalysis.value = [];
      } finally {
        analyzing.value = false;
      }
    };

    const parseAnalysisResult = (text) => {
      if (!text) {
        parsedAnalysis.value = [];
        return;
      }
      
      const sections = [];
      // Разбиваем текст на части по заголовкам ###
      const textSections = text.split(/(?=###\s*\d+\.)/);
      
      textSections.forEach((section) => {
        if (!section.trim()) return;
        
        // Извлекаем заголовок
        const headerMatch = section.match(/###\s*(\d+)\.\s*([^\n]+)/);
        if (headerMatch) {
          const number = parseInt(headerMatch[1]);
          const title = headerMatch[2].trim();
          const content = section.replace(/###\s*\d+\.\s*[^\n]+\n*/, '').trim();
          
          const items = parseSectionContent(content);
          
          sections.push({
            number,
            title,
            items
          });
        }
      });
      
      parsedAnalysis.value = sections;
    };
    
    const parseSectionContent = (content) => {
      if (!content) return [];
      
      const items = [];
      const lines = content.split('\n').filter(line => line.trim());
      
      let currentItem = null;
      
      lines.forEach((line) => {
        line = line.trim();
        if (!line) return;
        
        // Проверяем, является ли строка списком
        const listMatch = line.match(/^\*\s+(.+)$/);
        if (listMatch) {
          // Если это начало списка
          if (!currentItem || currentItem.type !== 'list') {
            if (currentItem) {
              items.push(currentItem);
            }
            currentItem = {
              type: 'list',
              label: null,
              items: []
            };
          }
          currentItem.items.push(listMatch[1]);
        } else {
          // Если был список, сохраняем его
          if (currentItem && currentItem.type === 'list') {
            items.push(currentItem);
            currentItem = null;
          }
          
          // Проверяем, есть ли метка (текст с **)
          const boldMatch = line.match(/\*\*([^*:]+):\*\*/);
          if (boldMatch) {
            // Если есть метка, создаем новый параграф
            if (currentItem) {
              items.push(currentItem);
            }
            const textAfterLabel = line.replace(/\*\*[^*:]+:\*\*\s*/, '').trim();
            currentItem = {
              type: 'paragraph',
              label: boldMatch[1],
              text: textAfterLabel || null
            };
          } else {
            // Обычный текст
            if (currentItem && currentItem.type === 'paragraph') {
              // Добавляем к существующему параграфу
              if (currentItem.text) {
                currentItem.text += ' ' + line;
              } else {
                currentItem.text = line;
              }
            } else {
              if (currentItem) {
                items.push(currentItem);
              }
              currentItem = {
                type: 'paragraph',
                label: null,
                text: line
              };
            }
          }
        }
      });
      
      // Добавляем последний элемент
      if (currentItem) {
        items.push(currentItem);
      }
      
      return items;
    };

    const getPlaceholderImage = () => {
      // Используем простой SVG placeholder в base64, чтобы избежать 404 ошибок
      const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#e0e0e0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">Нет изображения</text>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    const getImageSrc = (image) => {
      if (!image) return getPlaceholderImage()
      // Если это base64, возвращаем как есть
      if (image.startsWith('data:image')) {
        return image
      }
      // Если это URL, возвращаем как есть
      if (image.startsWith('http')) {
        return image
      }
      // Относительный путь
      return image.startsWith('/') ? image : `/${image}`
    }

    const handleImageError = (event) => {
      event.target.src = getPlaceholderImage()
    }

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
          fetchRecommendedProjects(),
          fetchAvailableStartups()
        ]);
      } finally {
        loading.value = false;
      }
    });

    return {
      loading,
      myInvestments,
      recommendedProjects,
      availableStartups,
      selectedStartupForAnalysis,
      analyzing,
      analysisResult,
      analysisError,
      totalInvested,
      avgRoi,
      investmentsByCategory,
      pieChartData,
      formatMoney,
      formatDate,
      getStatusText,
      getStageText,
      getCategoryColor,
      getImageSrc,
      handleImageError,
      getPlaceholderImage,
      viewProject,
      goToStartupCatalog,
      analyzeSelectedStartup,
      parsedAnalysis,
      parseAnalysisResult
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

.recommendations-card.full-width {
  grid-column: 1 / -1;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .recommendations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
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

.analysis-card {
  grid-column: 1 / -1;
}

.analysis-card.full-width {
  width: 100%;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analysis-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-selector label {
  font-weight: 600;
  color: #212529;
  font-size: 16px;
}

.analysis-controls {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.startup-select {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  transition: all 0.2s;
}

.startup-select:focus {
  border-color: #2196F3;
  outline: none;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.startup-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.analyze-btn {
  white-space: nowrap;
  min-width: 180px;
}

.analysis-result-container {
  margin-top: 24px;
  padding: 0;
}

.analysis-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.analysis-content {
  color: #495057;
  line-height: 1.8;
}

.analysis-blocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.analysis-block-card.full-width-block {
  grid-column: 1 / -1;
}

.analysis-block-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #2196F3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.analysis-block-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.block-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.block-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #2196F3;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.block-title {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
}

.block-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-paragraph {
  color: #495057;
  line-height: 1.7;
  font-size: 15px;
}

.item-paragraph strong {
  color: #212529;
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-label {
  color: #212529;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
}

.analysis-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.analysis-list-item {
  position: relative;
  padding: 8px 0 8px 20px;
  color: #495057;
  line-height: 1.7;
  font-size: 15px;
}

.analysis-list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2196F3;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.analysis-error {
  margin-top: 16px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-error i {
  font-size: 18px;
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

  .analysis-controls {
    flex-direction: column;
  }

  .analyze-btn {
    width: 100%;
  }

  .analysis-blocks-grid {
    grid-template-columns: 1fr;
  }

  .analysis-block-card {
    padding: 16px;
  }

  .block-title {
    font-size: 16px;
  }
}
</style> 