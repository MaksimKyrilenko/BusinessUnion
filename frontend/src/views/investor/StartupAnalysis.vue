<template>
  <div class="startup-analysis">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-chart-pie"></i>
          <span>Инвестору</span>
        </div>
        <h1 class="header-title">Аналитика инвестиций</h1>
        <p class="header-subtitle">AI-анализ стартапов для принятия инвестиционных решений</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-robot"></i></div>
          <div class="stat-content">
            <span class="stat-number">AI</span>
            <span class="stat-label">Анализ</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-lightbulb"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ availableStartups.length }}</span>
            <span class="stat-label">Стартапов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-clipboard-check"></i></div>
          <div class="stat-content">
            <span class="stat-number">5</span>
            <span class="stat-label">Критериев</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- Анализ стартапа -->
      <section class="analysis-section">
        <div class="section-card">
          <div class="section-header">
            <h2>Анализ стартапа</h2>
          </div>
          <div class="analysis-form">
            <label for="startup-select">Выберите стартап для анализа:</label>
            <div class="form-row">
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
              <button 
                class="analyze-btn"
                @click="analyzeSelectedStartup"
                :disabled="!selectedStartupForAnalysis || analyzing"
              >
                <i v-if="analyzing" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-chart-line"></i>
                {{ analyzing ? 'Анализ...' : 'Анализировать' }}
              </button>
            </div>
          </div>

          <!-- Analysis Results -->
          <div v-if="parsedAnalysis.length > 0" class="analysis-results">
            <h3>Результат анализа</h3>
            <div class="results-grid">
              <div 
                v-for="(section, index) in parsedAnalysis" 
                :key="index"
                class="result-card"
                :class="{ 'full-width': section.number === 5 }"
                :style="{ '--delay': index * 0.1 + 's' }"
              >
                <div class="result-header">
                  <span class="result-number">{{ section.number }}</span>
                  <h4>{{ section.title }}</h4>
                </div>
                <div class="result-body">
                  <div 
                    v-for="(item, itemIndex) in section.items" 
                    :key="itemIndex"
                    class="result-item"
                  >
                    <div v-if="item.type === 'paragraph'" class="item-text">
                      <strong v-if="item.label">{{ item.label }}</strong>
                      <span v-if="item.text">{{ item.text }}</span>
                    </div>
                    <div v-if="item.type === 'list'" class="item-list">
                      <strong v-if="item.label">{{ item.label }}</strong>
                      <ul>
                        <li v-for="(listItem, listIndex) in item.items" :key="listIndex">
                          {{ listItem }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="analysisError" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>{{ analysisError }}</p>
          </div>
        </div>
      </section>

      <!-- Рекомендуемые проекты -->
      <section class="projects-section">
        <div class="section-header">
          <h2>Рекомендуемые проекты</h2>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка рекомендаций...</p>
        </div>

        <div v-else-if="recommendedProjects.length === 0" class="empty-state">
          <i class="fas fa-folder-open"></i>
          <p>Пока нет рекомендаций</p>
        </div>

        <div v-else class="projects-grid">
          <div 
            v-for="(project, index) in recommendedProjects" 
            :key="project.id" 
            class="project-card"
            :style="{ '--delay': index * 0.08 + 's' }"
          >
            <div class="card-image">
              <img 
                :src="getImageSrc(project.image)" 
                :alt="project.title"
                @error="handleImageError"
              >
              <div class="stage-badge" :class="project.stage">
                {{ getStageText(project.stage) }}
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ project.title }}</h3>
              <div class="card-meta" v-if="project.category && project.category.name">
                <span class="category">{{ project.category.name }}</span>
              </div>
              <div class="card-stats">
                <div class="stat">
                  <span class="stat-label">Инвестиции</span>
                  <span class="stat-value">{{ formatMoney(project.investmentNeeded) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">ROI</span>
                  <span class="stat-value accent">{{ project.expectedRoi }}%</span>
                </div>
              </div>
              <button class="card-btn" @click="viewProject(project.id)">
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </section>
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
        
        // Извлекаем сообщение об ошибке
        let errorMessage = error.response?.data?.message || error.message || 'Не удалось проанализировать стартап';
        
        // Улучшаем сообщение для ошибок Yandex Cloud
        if (errorMessage.includes('Yandex Cloud') || errorMessage.includes('токен') || errorMessage.includes('expired')) {
          errorMessage = 'Сервис анализа временно недоступен. Токен доступа к Yandex Cloud AI истек. Пожалуйста, попробуйте позже или обратитесь к администратору.';
        } else if (errorMessage.includes('UNAUTHENTICATED')) {
          errorMessage = 'Ошибка аутентификации в сервисе анализа. Пожалуйста, попробуйте позже.';
        }
        
        analysisError.value = errorMessage;
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
/* Base Layout */
.startup-analysis {
  min-height: 100vh;
  background: #f1f5f9;
  padding: 1rem;
}

/* Blue Header */
.page-header-blue {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  color: #fff;
  box-shadow: 0 8px 30px rgba(37,99,235,0.2);
}
.page-header-blue .header-left { flex: 1; }
.page-header-blue .header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}
.page-header-blue .header-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
.page-header-blue .header-subtitle { font-size: 0.95rem; opacity: 0.85; margin: 0; max-width: 400px; }
.page-header-blue .header-stats { display: flex; gap: 0.875rem; flex-shrink: 0; }
.page-header-blue .stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.page-header-blue .stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-header-blue .stat-content { display: flex; flex-direction: column; }
.page-header-blue .stat-number { font-size: 1.25rem; font-weight: 700; line-height: 1; color: #fff !important; }
.page-header-blue .stat-label { font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; color: #fff !important; text-transform: none !important; letter-spacing: normal !important; }

@media (max-width: 900px) {
  .page-header-blue { flex-direction: column; gap: 1.25rem; }
  .page-header-blue .header-stats { width: 100%; }
  .page-header-blue .stat-card { flex: 1; min-width: 90px; }
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}

/* Analysis Section */
.analysis-section {
  margin-bottom: 2.5rem;
}

.section-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1C1C1E;
}

.analysis-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.analysis-form label {
  font-size: 0.875rem;
  color: #6E6E73;
  font-weight: 400;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.startup-select {
  flex: 1;
  max-width: 320px;
  padding: 0.75rem 1rem;
  background: #F5F7FA;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #1C1C1E;
  transition: all 0.2s ease;
}

.startup-select:focus {
  outline: none;
  border-color: #1E6BFF;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(30, 107, 255, 0.1);
}

.startup-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analyze-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #1E6BFF;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(30, 107, 255, 0.25);
}

.analyze-btn:hover:not(:disabled) {
  background: #1557D4;
  box-shadow: 0 4px 12px rgba(30, 107, 255, 0.35);
  transform: translateY(-1px);
}

.analyze-btn:disabled {
  background: #C7C7CC;
  box-shadow: none;
  cursor: not-allowed;
}

.analyze-btn i {
  font-size: 0.8rem;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6E6E73;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #F5F7FA;
  border-top-color: #1E6BFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #FFF3CD;
  border-radius: 10px;
  margin-top: 1rem;
}

.error-message i {
  color: #D97706;
  font-size: 1.25rem;
}

.error-message p {
  margin: 0;
  color: #92400E;
  font-size: 0.875rem;
}

/* Analysis Results */
.analysis-results {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #F5F7FA;
}

.analysis-results h3 {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1C1C1E;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.result-card {
  background: #FFFFFF;
  border: 1px solid #F5F7FA;
  border-radius: 12px;
  padding: 1.25rem;
  animation: fadeSlideIn 0.4s ease-out backwards;
  animation-delay: var(--delay);
  transition: all 0.3s ease;
}

.result-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.result-card.full-width {
  grid-column: 1 / -1;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.result-number {
  width: 28px;
  height: 28px;
  background: #1E6BFF;
  color: #FFFFFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1C1C1E;
}

.result-body {
  color: #6E6E73;
  font-size: 0.875rem;
  line-height: 1.6;
}

.result-item {
  margin-bottom: 0.75rem;
}

.result-item:last-child {
  margin-bottom: 0;
}

.item-text strong {
  color: #1C1C1E;
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}

.item-list strong {
  color: #1C1C1E;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.item-list ul {
  margin: 0;
  padding-left: 1.25rem;
}

.item-list li {
  margin-bottom: 0.35rem;
}

/* Projects Section */
.projects-section {
  margin-top: 1rem;
}

.projects-section .section-header {
  margin-bottom: 1.5rem;
}

.projects-section .section-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1C1C1E;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

/* Project Card */
.project-card {
  background: #FFFFFF;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: fadeSlideIn 0.4s ease-out backwards;
  animation-delay: var(--delay);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  height: 140px;
  background: #F5F7FA;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.35rem 0.65rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #6E6E73;
  backdrop-filter: blur(4px);
}

.stage-badge.idea { color: #8B5CF6; }
.stage-badge.mvp { color: #1E6BFF; }
.stage-badge.growth { color: #10B981; }
.stage-badge.scaling { color: #F59E0B; }

.card-body {
  padding: 1rem;
}

.card-title {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1C1C1E;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  margin-bottom: 0.75rem;
}

.card-meta .category {
  font-size: 0.75rem;
  color: #6E6E73;
}

.card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  flex: 1;
}

.stat-label {
  font-size: 0.65rem;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.15rem;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1C1C1E;
}

.stat-value.accent {
  color: #1E6BFF;
}

.card-btn {
  width: 100%;
  padding: 0.65rem;
  background: #1E6BFF;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-btn:hover {
  background: #1557D4;
}

/* Responsive */
@media (max-width: 1400px) {
  .projects-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .page-header,
  .page-content {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .startup-select {
    max-width: 100%;
  }
  
  .analyze-btn {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .page-header,
  .page-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .card-image {
    height: 160px;
  }
}
</style> 