<template>
  <div class="startup-details-page">
    <div class="container" v-if="loading">
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Загрузка информации о стартапе...</p>
      </div>
    </div>

    <div class="container" v-else-if="error">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <BaseButton @click="goBack" variant="outline">Вернуться назад</BaseButton>
      </div>
    </div>

    <div class="container" v-else-if="startup">
      <div class="page-header">
        <button class="back-button" @click="goBack">
          <i class="fas fa-arrow-left"></i> Назад
        </button>
        <div class="page-actions" v-if="isOwnStartup">
          <BaseButton variant="outline" @click="editStartup">
            <i class="fas fa-edit"></i> Редактировать
          </BaseButton>
        </div>
      </div>

      <div class="startup-hero">
        <div class="hero-image">
          <img 
            :src="getImageSrc(startup.image)" 
            :alt="startup.title"
            @error="handleImageError"
          >
        </div>
        <div class="hero-content">
          <div class="hero-meta">
            <div class="badge stage-badge">{{ getStageText(startup.stage) }}</div>
            <div class="badge category-badge" v-if="startup.category && startup.category.name">{{ startup.category.name }}</div>
          </div>
          <h1>{{ startup.title }}</h1>
          <div class="hero-location" v-if="startup.location">
            <i class="fas fa-map-marker-alt"></i> {{ startup.location }}
          </div>
          <div class="hero-author" v-if="startup.author">
            <div class="author-avatar">
              <img 
                :src="getAvatarSrc(startup.author.avatar)" 
                :alt="getAuthorName"
                @error="handleAvatarError"
              >
            </div>
            <div class="author-info">
              <div class="author-name">{{ getAuthorName }}</div>
              <div class="author-joined">На платформе с {{ formatDate(startup.author.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="startup-content">
        <div class="content-main">
          <section class="content-section">
            <h2>О проекте</h2>
            <div class="section-content">
              <p>{{ startup.description }}</p>
              
              <!-- Документы проекта -->
              <div v-if="startup.presentationUrl || startup.businessPlanUrl" class="project-documents">
                <h3 class="documents-title">Документы проекта</h3>
                <div class="documents-grid">
                  <a v-if="startup.presentationUrl" :href="startup.presentationUrl" target="_blank" class="document-card">
                    <div class="document-icon presentation">
                      <i class="fas fa-file-powerpoint"></i>
                    </div>
                    <div class="document-info">
                      <div class="document-title">Презентация проекта</div>
                      <div class="document-action">
                        <i class="fas fa-download"></i> Скачать
                      </div>
                    </div>
                  </a>
                  
                  <a v-if="startup.businessPlanUrl" :href="startup.businessPlanUrl" target="_blank" class="document-card">
                    <div class="document-icon business-plan">
                      <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="document-info">
                      <div class="document-title">Бизнес-план проекта</div>
                      <div class="document-action">
                        <i class="fas fa-download"></i> Скачать
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section class="content-section" v-if="startup.additionalInfo">
            <h2>Дополнительная информация</h2>
            <div class="section-content">
              <div class="info-grid">
                <div class="info-item" v-if="startup.additionalInfo.hasTeam">
                  <div class="info-icon"><i class="fas fa-users"></i></div>
                  <div class="info-content">
                    <div class="info-label">Команда</div>
                    <div class="info-value">{{ startup.additionalInfo.teamSize || 'Имеется' }}</div>
                  </div>
                </div>

                <div class="info-item" v-if="startup.additionalInfo.hasMVP">
                  <div class="info-icon"><i class="fas fa-rocket"></i></div>
                  <div class="info-content">
                    <div class="info-label">MVP</div>
                    <div class="info-value">Имеется</div>
                  </div>
                </div>

                <div class="info-item" v-if="startup.additionalInfo.foundedAt">
                  <div class="info-icon"><i class="fas fa-calendar-alt"></i></div>
                  <div class="info-content">
                    <div class="info-label">Основан</div>
                    <div class="info-value">{{ startup.additionalInfo.foundedAt }}</div>
                  </div>
                </div>

                <div class="info-item" v-if="startup.additionalInfo.market">
                  <div class="info-icon"><i class="fas fa-chart-line"></i></div>
                  <div class="info-content">
                    <div class="info-label">Рынок</div>
                    <div class="info-value">{{ startup.additionalInfo.market }}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>


        </div>

        <div class="content-sidebar">
          <div class="sidebar-card investment-card">
            <h3>Инвестиции</h3>
            <div class="investment-amount">
              <div class="amount-label">Требуемые инвестиции</div>
              <div class="amount-value">{{ formatMoney(startup.investmentNeeded) }}</div>
            </div>
            
            <div class="investment-details">
              <div class="detail-item">
                <div class="detail-label">Минимальная инвестиция</div>
                <div class="detail-value">{{ formatMoney(startup.minInvestment || 0) }}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Ожидаемая ROI</div>
                <div class="detail-value">{{ startup.expectedRoi || 0 }}%</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Статус</div>
                <div class="detail-value">{{ getStatusText(startup.status) }}</div>
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
import { useRouter, useRoute } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import Modal from '@/components/ui/Modal.vue';
import { projectsService } from '@/services/projects.service';
import authService from '@/services/auth.service';

export default {
  name: 'StartupDetails',
  components: {
    BaseButton,
    Modal
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const startup = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const currentUser = ref(null);

    // Получение данных о стартапе
    const fetchStartup = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const startupId = route.params.id;
        if (!startupId) {
          throw new Error('ID стартапа не указан');
        }
        
        const response = await projectsService.getProjectById(startupId);
        startup.value = response;
        console.log('Получены данные о стартапе:', startup.value);
      } catch (err) {
        console.error('Ошибка при загрузке стартапа:', err);
        error.value = 'Не удалось загрузить информацию о стартапе. Пожалуйста, попробуйте позже.';
      } finally {
        loading.value = false;
      }
    };
    
    // Получение данных о текущем пользователе
    const fetchCurrentUser = async () => {
      try {
        currentUser.value = await authService.getCurrentUser();
      } catch (err) {
        console.error('Ошибка при получении данных пользователя:', err);
      }
    };
    
    // Проверка, является ли текущий пользователь автором стартапа
    const isOwnStartup = computed(() => {
      if (!startup.value || !currentUser.value) return false;
      return startup.value.authorId === currentUser.value.id;
    });
    
    // Получение имени автора
    const getAuthorName = computed(() => {
      if (!startup.value || !startup.value.author) return 'Автор';
      const { firstName, lastName } = startup.value.author;
      return `${firstName || ''} ${lastName || ''}`.trim() || 'Автор';
    });
    
    // Форматирование денежной суммы
    const formatMoney = (amount) => {
      if (!amount) return '0 ₽';
      return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB',
        maximumFractionDigits: 0 
      }).format(amount);
    };
    
    // Получение текста для статуса
    const getStatusText = (status) => {
      const statusMap = {
        active: 'Активен',
        pending: 'На рассмотрении',
        funded: 'Финансируется',
        completed: 'Завершен',
        rejected: 'Отклонен'
      };
      
      return statusMap[status] || 'Неизвестно';
    };
    
    // Получение текста для стадии
    const getStageText = (stage) => {
      const stageMap = {
        idea: 'Идея',
        mvp: 'MVP',
        growth: 'Рост',
        scaling: 'Масштабирование'
      };
      
      return stageMap[stage] || 'Неизвестно';
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

    const getDefaultAvatar = () => {
      const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#e2e8f0"/>
        <circle cx="50" cy="35" r="20" fill="#94a3b8"/>
        <ellipse cx="50" cy="85" rx="30" ry="25" fill="#94a3b8"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    const getAvatarSrc = (avatar) => {
      if (!avatar) return getDefaultAvatar()
      if (avatar.startsWith('data:image')) return avatar
      if (avatar.startsWith('http')) return avatar
      return avatar.startsWith('/') ? avatar : `/${avatar}`
    }

    const handleAvatarError = (event) => {
      event.target.src = getDefaultAvatar()
    }
    
    // Форматирование даты
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    };
    
    // Переход назад
    const goBack = () => {
      router.back();
    };
    
    // Переход к редактированию стартапа
    const editStartup = () => {
      if (startup.value) {
        router.push({ name: 'EditStartup', params: { id: startup.value.id } });
      }
    };
    
    
    onMounted(() => {
      fetchStartup();
      fetchCurrentUser();
    });
    
    return {
      startup,
      loading,
      error,
      isOwnStartup,
      getAuthorName,
      formatMoney,
      getStatusText,
      getStageText,
      getImageSrc,
      handleImageError,
      getPlaceholderImage,
      getAvatarSrc,
      handleAvatarError,
      getDefaultAvatar,
      formatDate,
      goBack,
      editStartup
    };
  }
};
</script>

<style scoped>
.startup-details-page {
  padding-bottom: 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-top: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: none;
  color: #495057;
  cursor: pointer;
  font-size: 16px;
}

.back-button:hover {
  color: #212529;
}

.startup-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.hero-image {
  height: 100%;
  min-height: 300px;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.stage-badge {
  background-color: #e9ecef;
  color: #495057;
}

.category-badge {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.hero-content h1 {
  margin: 0 0 16px 0;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  color: #1e293b;
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: #6c757d;
  font-size: 16px;
}

.hero-author {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
}

.author-joined {
  font-size: 14px;
  color: #6c757d;
}

.startup-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.content-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.content-section h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.section-content {
  color: #495057;
  line-height: 1.6;
}

.section-content p {
  margin-bottom: 16px;
}

.section-content p:last-child {
  margin-bottom: 0;
}

/* Документы проекта */
.project-documents {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.documents-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.document-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.document-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(33, 150, 243, 0.15);
  border-color: #2196F3;
}

.document-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.document-icon.presentation {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: white;
}

.document-icon.business-plan {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
}

.document-card .document-info {
  flex: 1;
}

.document-card .document-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.document-action {
  font-size: 14px;
  color: #2196F3;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  border-radius: 12px;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 500;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  text-decoration: none;
  color: #212529;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.document-link:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.document-link i {
  font-size: 28px;
  color: #2196F3;
}

.document-info {
  flex: 1;
}

.document-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.document-desc {
  font-size: 14px;
  color: #6c757d;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-card h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.investment-amount {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
}

.amount-label {
  font-size: 14px;
  color: #1565c0;
  margin-bottom: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: #0d47a1;
}

.investment-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s;
}

.detail-item:hover {
  background: rgba(33, 150, 243, 0.03);
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 8px;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.investment-actions {
  margin-top: 16px;
}


.loading-indicator, .error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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

.error-message {
  color: #dc3545;
}

.error-message i {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message p {
  margin-bottom: 24px;
  font-size: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


@media (max-width: 768px) {
  .startup-hero {
    grid-template-columns: 1fr;
  }
  
  .hero-image {
    height: 200px;
  }
  
  .startup-content {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 