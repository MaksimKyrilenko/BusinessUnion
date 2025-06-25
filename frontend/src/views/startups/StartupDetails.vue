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
          <img :src="startup.image || '/assets/images/placeholder-project.jpg'" :alt="startup.title">
        </div>
        <div class="hero-content">
          <div class="hero-meta">
            <div class="badge stage-badge">{{ getStageText(startup.stage) }}</div>
            <div class="badge category-badge" v-if="startup.category">{{ startup.category.name }}</div>
          </div>
          <h1>{{ startup.title }}</h1>
          <div class="hero-location" v-if="startup.location">
            <i class="fas fa-map-marker-alt"></i> {{ startup.location }}
          </div>
          <div class="hero-author" v-if="startup.author">
            <div class="author-avatar">
              <img :src="startup.author.avatar || '/assets/images/default-avatar.png'" :alt="getAuthorName">
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

          <section class="content-section" v-if="startup.businessPlanUrl || startup.presentationUrl">
            <h2>Документы</h2>
            <div class="section-content">
              <div class="documents-list">
                <a v-if="startup.businessPlanUrl" :href="startup.businessPlanUrl" target="_blank" class="document-link">
                  <i class="fas fa-file-pdf"></i>
                  <div class="document-info">
                    <div class="document-title">Бизнес-план</div>
                    <div class="document-desc">Скачать PDF</div>
                  </div>
                </a>
                
                <a v-if="startup.presentationUrl" :href="startup.presentationUrl" target="_blank" class="document-link">
                  <i class="fas fa-file-powerpoint"></i>
                  <div class="document-info">
                    <div class="document-title">Презентация</div>
                    <div class="document-desc">Скачать презентацию</div>
                  </div>
                </a>
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
            
            <div class="investment-actions">
              <BaseButton 
                variant="primary" 
                block 
                @click="showContactModal = true"
              >
                Инвестировать
              </BaseButton>
            </div>
          </div>
          
          <div class="sidebar-card contact-card">
            <h3>Связаться с автором</h3>
            <p>Заинтересованы в этом проекте? Свяжитесь с автором для получения дополнительной информации.</p>
            <BaseButton 
              variant="outline" 
              block 
              @click="showContactModal = true"
            >
              Отправить сообщение
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для связи с автором -->
    <Modal v-if="showContactModal" @close="showContactModal = false">
      <div class="contact-modal">
        <h2>Связаться с автором проекта</h2>
        <p>Заполните форму, чтобы отправить сообщение автору проекта "{{ startup?.title }}"</p>
        
        <form @submit.prevent="sendMessage">
          <div class="form-group">
            <label for="messageSubject">Тема</label>
            <input 
              id="messageSubject" 
              v-model="contactForm.subject" 
              type="text" 
              placeholder="Укажите тему сообщения"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="messageText">Сообщение</label>
            <textarea 
              id="messageText" 
              v-model="contactForm.message" 
              rows="5" 
              placeholder="Введите ваше сообщение..."
              required
            ></textarea>
          </div>
          
          <div class="form-actions">
            <BaseButton type="button" variant="outline" @click="showContactModal = false">
              Отмена
            </BaseButton>
            <BaseButton type="submit" variant="primary" :loading="contactForm.sending">
              Отправить
            </BaseButton>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import Modal from '@/components/ui/Modal.vue';
import { projectsService } from '@/services/projects.service';
import authService from '@/services/auth.service';
import { chatService } from '@/services/chat.service';

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
    const showContactModal = ref(false);
    const currentUser = ref(null);
    
    const contactForm = ref({
      subject: '',
      message: '',
      sending: false
    });

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
    
    // Отправка сообщения автору
    const sendMessage = async () => {
      if (!startup.value || !startup.value.author || !contactForm.value.message) {
        return;
      }
      
      contactForm.value.sending = true;
      
      try {
        // Создаем новый чат или используем существующий
        const chatResponse = await chatService.createOrGetDirectChat(startup.value.authorId);
        
        // Отправляем сообщение
        await chatService.sendMessage({
          chatId: chatResponse.id,
          text: contactForm.value.message,
          subject: contactForm.value.subject
        });
        
        // Закрываем модальное окно и очищаем форму
        showContactModal.value = false;
        contactForm.value.subject = '';
        contactForm.value.message = '';
        
        // Переходим в чат
        router.push({ 
          name: 'Messenger',
          params: { chatId: chatResponse.id }
        });
      } catch (err) {
        console.error('Ошибка при отправке сообщения:', err);
        // TODO: Показать пользователю ошибку
      } finally {
        contactForm.value.sending = false;
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
      showContactModal,
      contactForm,
      isOwnStartup,
      getAuthorName,
      formatMoney,
      getStatusText,
      getStageText,
      formatDate,
      goBack,
      editStartup,
      sendMessage
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
  gap: 30px;
  margin-bottom: 40px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  font-size: 32px;
  line-height: 1.2;
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
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #212529;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #e9ecef;
  border-radius: 50%;
  color: #495057;
  font-size: 16px;
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
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #212529;
  transition: background 0.2s;
}

.document-link:hover {
  background: #e9ecef;
}

.document-link i {
  font-size: 24px;
  color: #6c757d;
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
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #212529;
}

.investment-amount {
  background: #f1f8ff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.amount-label {
  font-size: 14px;
  color: #0d47a1;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: #0d47a1;
}

.investment-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6c757d;
  font-size: 14px;
}

.detail-value {
  font-weight: 500;
}

.investment-actions {
  margin-top: 16px;
}

.contact-card {
  background: #f8f9fa;
}

.contact-card p {
  margin-bottom: 16px;
  color: #495057;
  line-height: 1.5;
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
  border-top: 4px solid #007bff;
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

.contact-modal {
  padding: 20px;
  max-width: 600px;
}

.contact-modal h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.contact-modal p {
  margin-bottom: 24px;
  color: #495057;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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