<template>
  <div class="my-startups">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-rocket"></i>
          <span>Стартаперу</span>
        </div>
        <h1 class="header-title">Мои стартапы</h1>
        <p class="header-subtitle">Управляйте своими проектами и отслеживайте прогресс</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ createdByMe.length }}</span>
            <span class="stat-label">Созданных</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ memberOf.length }}</span>
            <span class="stat-label">Участие</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ createdByMe.length + memberOf.length }}</span>
            <span class="stat-label">Всего</span>
          </div>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <button v-if="!selectedProjectId" @click="showCreateModal = true" class="create-btn">
        <i class="fas fa-plus"></i>
        Создать стартап
      </button>
      <button v-else @click="selectedProjectId = null" class="back-btn">
        <i class="fas fa-arrow-left"></i>
        Вернуться к списку
      </button>
    </div>

    <!-- Модальное окно для создания стартапа -->
    <Modal :show="showCreateModal" @close="closeCreateModal">
      <template #header>
        <h2>Создание стартапа</h2>
      </template>
      
      <template #default>
        <CreateStartupForm @success="handleStartupCreated" @cancel="closeCreateModal" />
      </template>
    </Modal>
    
    <!-- Контент -->
    <div class="tab-content">
      <!-- Список стартапов -->
      <div v-if="!selectedProjectId" class="startups-tab">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Загрузка стартапов...</p>
        </div>
        
        <div v-else class="startups-lists">
          <!-- Список "Созданные мной" -->
          <div class="startup-list-section">
            <div class="list-header" @click="createdByMeExpanded = !createdByMeExpanded">
              <h2>
                <i class="fas" :class="createdByMeExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                Созданные мной
                <span class="count-badge" v-if="createdByMe.length > 0">{{ createdByMe.length }}</span>
              </h2>
            </div>
            <div v-if="createdByMeExpanded" class="list-content">
              <div v-if="createdByMe.length === 0" class="empty-state">
                <p>У вас пока нет созданных стартапов</p>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  Создать стартап
                </button>
              </div>
              <div v-else class="startups-grid">
          <div 
            v-for="startup in createdByMe" 
            :key="startup.id" 
            class="startup-card clickable"
            @click="openTeamManagement(startup.id)"
          >
            <div class="startup-image">
              <img 
                :src="getImageSrc(startup.image)" 
                :alt="startup.title" 
                class="image"
                @error="handleImageError"
              >
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
            </div>
          </div>
        </div>
          </div>
        </div>

          <!-- Список "Где я участник" -->
          <div class="startup-list-section">
            <div class="list-header" @click="memberOfExpanded = !memberOfExpanded">
              <h2>
                <i class="fas" :class="memberOfExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                Где я участник
                <span class="count-badge" v-if="memberOf.length > 0">{{ memberOf.length }}</span>
              </h2>
            </div>
            <div v-if="memberOfExpanded" class="list-content">
              <div v-if="memberOf.length === 0" class="empty-state">
                <p>Вы пока не являетесь участником ни одного стартапа</p>
              </div>
              <div v-else class="startups-grid">
                <div 
                  v-for="startup in memberOf" 
                  :key="startup.id" 
                  class="startup-card clickable"
                  @click="openTeamManagement(startup.id)"
                >
                  <div class="startup-image">
                    <img 
                      :src="getImageSrc(startup.image)" 
                      :alt="startup.title" 
                      class="image"
                      @error="handleImageError"
                    >
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Управление командой -->
      <div v-else class="team-tab">
        <TeamManagement 
          ref="teamManagementRef"
          :startups="[...createdByMe, ...memberOf]"
          :initial-project-id="selectedProjectId"
          @refresh="fetchStartups"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { projectsService } from '@/services/projects.service';
import Modal from '@/components/ui/Modal.vue';
import CreateStartupForm from './CreateStartupForm.vue';
import TeamManagement from './TeamManagement.vue';

export default {
  name: 'MyStartups',
  components: {
    Modal,
    CreateStartupForm,
    TeamManagement
  },
  setup() {
    const createdByMe = ref([]);
    const memberOf = ref([]);
    const loading = ref(false);
    const showCreateModal = ref(false);
    const createdByMeExpanded = ref(true);
    const memberOfExpanded = ref(true);
    const selectedProjectId = ref(null);
    const teamManagementRef = ref(null);

    const fetchStartups = async () => {
      loading.value = true;
      try {
        const [createdResponse, memberResponse] = await Promise.all([
          projectsService.getMyProjects(),
          projectsService.getProjectsWhereIAmMember()
        ]);
        console.log('Получены созданные стартапы:', createdResponse);
        console.log('Получены стартапы, где я участник:', memberResponse);
        createdByMe.value = createdResponse || [];
        memberOf.value = memberResponse || [];
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

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const handleStartupCreated = () => {
      showCreateModal.value = false;
      fetchStartups(); // Обновляем список стартапов
    };

    const getImageSrc = (image) => {
      if (!image) return getPlaceholderImage();
      // Если это base64, возвращаем как есть
      if (image.startsWith('data:image')) {
        return image;
      }
      // Если это URL, возвращаем как есть
      if (image.startsWith('http')) {
        return image;
      }
      // Относительный путь
      return image.startsWith('/') ? image : `/${image}`;
    };

    const getPlaceholderImage = () => {
      // Используем простой SVG placeholder в base64, чтобы избежать 404 ошибок
      const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#e0e0e0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">Нет изображения</text>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    const handleImageError = (event) => {
      event.target.src = getPlaceholderImage();
    };

    const openTeamManagement = (projectId) => {
      selectedProjectId.value = projectId;
    };

    onMounted(fetchStartups);

    return {
      createdByMe,
      memberOf,
      loading,
      showCreateModal,
      createdByMeExpanded,
      memberOfExpanded,
      selectedProjectId,
      teamManagementRef,
      formatCurrency,
      getStatusText,
      getStageText,
      closeCreateModal,
      handleStartupCreated,
      getImageSrc,
      handleImageError,
      getPlaceholderImage,
      openTeamManagement
    };
  }
};
</script>

<style scoped>
.my-startups {
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
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
.page-header-blue .stat-number { font-size: 1.25rem; font-weight: 700; line-height: 1; color: #fff; }
.page-header-blue .stat-label { font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; color: #fff; }

@media (max-width: 900px) {
  .page-header-blue { flex-direction: column; gap: 1.25rem; }
  .page-header-blue .header-stats { width: 100%; }
  .page-header-blue .stat-card { flex: 1; min-width: 90px; }
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #2196F3;
  background: rgba(33, 150, 243, 0.05);
}

.tab-btn.active {
  color: #2196F3;
  border-bottom-color: #2196F3;
  font-weight: 600;
}

.tab-content {
  min-height: 400px;
}

.startups-lists {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.startup-list-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.list-header:hover {
  background: #e9ecef;
}

.list-header h2 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #333;
}

.list-header h2 i {
  color: #2196F3;
  transition: transform 0.2s;
}

.count-badge {
  background: #2196F3;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-left: auto;
}

.list-content {
  padding: 1.5rem;
}

.create-btn {
  background: #2196F3;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.create-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.back-btn {
  background: #2196F3;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.back-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
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

.startup-card.clickable {
  cursor: pointer;
}

.startup-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  background: #2196F3;
  color: white;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.btn-secondary {
  background: #2196F3;
  color: white;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  opacity: 1;
  background: #1976D2;
  transform: translateY(-1px);
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
  border-top: 4px solid #2196F3;
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