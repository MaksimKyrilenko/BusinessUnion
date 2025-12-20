<template>
  <div class="startup-details">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка информации о стартапе...</p>
    </div>
    <div v-else-if="!startup" class="not-found">
      <h2>Стартап не найден</h2>
      <p>Извините, запрашиваемый стартап не существует или был удален.</p>
      <BaseButton variant="primary" @click="router.push('/startups')">
        Вернуться к каталогу
      </BaseButton>
    </div>
    <div v-else class="details-content">
      <div class="details-header">
        <div class="header-actions">
          <BaseButton 
            variant="text" 
            @click="router.push('/startups')"
            class="back-btn"
          >
            ← Назад к каталогу
          </BaseButton>
          <div class="actions-right" v-if="isOwner">
            <BaseButton 
              variant="outlined" 
              @click="editStartup"
            >
              Редактировать
            </BaseButton>
          </div>
        </div>
        <h1>{{ startup.title }}</h1>
        <div class="meta-info">
          <span class="meta-item stage">
            <span class="stage-label">Стадия:</span>
            <span class="stage-value">{{ getStageText(startup.stage) }}</span>
          </span>
          <span class="meta-item category" v-if="startup.category">
            <span class="category-label">Категория:</span>
            <span class="category-value">{{ startup.category.name }}</span>
          </span>
          <span class="meta-item location" v-if="startup.location">
            <span class="location-label">Локация:</span>
            <span class="location-value">{{ startup.location }}</span>
          </span>
        </div>
      </div>

      <div class="details-main">
        <div class="details-left">
          <div class="startup-image">
            <img :src="startup.image || '/assets/images/placeholder-project.jpg'" :alt="startup.title">
          </div>
          
          <div class="startup-metrics card">
            <div class="metric">
              <div class="metric-label">Требуемые инвестиции</div>
              <div class="metric-value">{{ formatMoney(startup.investmentNeeded) }}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Собрано</div>
              <div class="metric-value">{{ formatMoney(startup.investmentCollected) }}</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${calculateProgress()}%` }"></div>
              </div>
            </div>
            <div class="metric">
              <div class="metric-label">Минимальная инвестиция</div>
              <div class="metric-value">{{ formatMoney(startup.minInvestment) }}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Ожидаемая доходность</div>
              <div class="metric-value accent">{{ startup.expectedRoi }}%</div>
            </div>
          </div>

          <div class="invest-section card" v-if="!isOwner">
            <h3>Инвестировать в проект</h3>
            <form @submit.prevent="submitInvestment">
              <div class="form-group">
                <label for="investmentAmount">Сумма инвестиции (₽)</label>
                <input 
                  type="number" 
                  id="investmentAmount" 
                  v-model="investmentAmount" 
                  :min="startup.minInvestment" 
                  :step="10000"
                  required
                >
                <div class="input-hint" v-if="startup.minInvestment">
                  Минимальная сумма: {{ formatMoney(startup.minInvestment) }}
                </div>
              </div>
              <BaseButton 
                type="submit" 
                variant="primary" 
                class="invest-btn"
                :loading="investLoading"
              >
                Инвестировать
              </BaseButton>
            </form>
          </div>

          <div class="contact-section card">
            <h3>Связаться с командой</h3>
            <form @submit.prevent="submitContact">
              <div class="form-group">
                <label for="contactMessage">Сообщение</label>
                <textarea 
                  id="contactMessage" 
                  v-model="contactMessage" 
                  rows="4"
                  placeholder="Опишите свой вопрос или предложение"
                  required
                ></textarea>
              </div>
              <BaseButton 
                type="submit" 
                variant="primary" 
                class="contact-btn"
                :loading="contactLoading"
              >
                Отправить сообщение
              </BaseButton>
            </form>
          </div>
        </div>

        <div class="details-right">
          <div class="description-section card">
            <h3>Описание</h3>
            <p class="description">{{ startup.description }}</p>
          </div>
          
          <div class="additional-info card" v-if="startup.additionalInfo">
            <h3>Дополнительная информация</h3>
            <p class="additional-text">{{ startup.additionalInfo }}</p>
          </div>
          
          <div class="timeline-section card" v-if="startup.stages && startup.stages.length">
            <h3>Этапы проекта</h3>
            <div class="timeline">
              <div 
                v-for="(stage, index) in startup.stages" 
                :key="index"
                class="timeline-item"
                :class="{ 'completed': stage.completed }"
              >
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <h4>{{ stage.title }}</h4>
                  <div class="timeline-date">{{ formatDate(stage.date) }}</div>
                  <p>{{ stage.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="team-section card" v-if="startup.team && startup.team.length">
            <h3>Команда проекта</h3>
            <div class="team-members">
              <div 
                v-for="member in startup.team" 
                :key="member.id"
                class="team-member"
              >
                <div class="member-avatar">
                  <img :src="member.avatar || '/assets/images/default-avatar.svg'" :alt="member.name">
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <div class="member-position">{{ member.position }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="investors-section card" v-if="isOwner && startup.investors && startup.investors.length">
            <h3>Инвесторы проекта</h3>
            <div class="investors-list">
              <div 
                v-for="investor in startup.investors" 
                :key="investor.id"
                class="investor-item"
              >
                <div class="investor-info">
                  <h4>{{ investor.name }}</h4>
                  <div class="investor-email">{{ investor.email }}</div>
                </div>
                <div class="investment-info">
                  <div class="investment-amount">{{ formatMoney(investor.amount) }}</div>
                  <div class="investment-date">{{ formatDate(investor.date) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно успешной инвестиции -->
    <BaseModal v-model="showSuccessModal">
      <div class="success-modal">
        <div class="modal-icon">✓</div>
        <h3>Инвестиция успешно выполнена!</h3>
        <p>Ваша инвестиция в проект "{{ startup?.title }}" на сумму {{ formatMoney(investmentAmount) }} была успешно обработана.</p>
        <BaseButton variant="primary" @click="showSuccessModal = false">
          Продолжить
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { projectsService } from '@/services/projects.service';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'StartupDetails',
  components: {
    BaseButton,
    BaseModal
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    
    // Состояния
    const startup = ref(null);
    const loading = ref(true);
    const investmentAmount = ref(0);
    const investLoading = ref(false);
    const contactMessage = ref('');
    const contactLoading = ref(false);
    const showSuccessModal = ref(false);
    
    // Вычисляемые свойства
    const isOwner = computed(() => {
      if (!startup.value || !authStore.user) return false;
      return startup.value.ownerId === authStore.user.id;
    });
    
    // Методы
    const fetchStartupDetails = async () => {
      loading.value = true;
      try {
        const id = route.params.id;
        const data = await projectsService.getProjectById(id);
        startup.value = data;
        
        if (startup.value && startup.value.minInvestment) {
          investmentAmount.value = startup.value.minInvestment;
        }
        
        console.log('Получены данные стартапа:', data);
      } catch (error) {
        console.error('Ошибка при получении данных стартапа:', error);
        startup.value = null;
      } finally {
        loading.value = false;
      }
    };
    
    const calculateProgress = () => {
      if (!startup.value || !startup.value.investmentNeeded || startup.value.investmentNeeded === 0) {
        return 0;
      }
      
      const collected = startup.value.investmentCollected || 0;
      const progress = (collected / startup.value.investmentNeeded) * 100;
      return Math.min(progress, 100);
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
    
    const submitInvestment = async () => {
      if (!startup.value || !authStore.user) return;
      
      investLoading.value = true;
      try {
        const response = await projectsService.investInProject({
          projectId: startup.value.id,
          amount: investmentAmount.value
        });
        
        console.log('Инвестиция выполнена успешно:', response);
        
        // Обновляем данные стартапа после успешной инвестиции
        await fetchStartupDetails();
        
        // Показываем модальное окно успеха
        showSuccessModal.value = true;
        
      } catch (error) {
        console.error('Ошибка при выполнении инвестиции:', error);
        alert('Произошла ошибка при выполнении инвестиции. Пожалуйста, попробуйте позже.');
      } finally {
        investLoading.value = false;
      }
    };
    
    const submitContact = async () => {
      if (!startup.value || !contactMessage.value.trim()) return;
      
      contactLoading.value = true;
      try {
        const response = await chatService.sendMessage({
          recipientId: startup.value.ownerId,
          content: contactMessage.value,
          projectId: startup.value.id
        });
        
        console.log('Сообщение отправлено успешно:', response);
        contactMessage.value = '';
        alert('Ваше сообщение успешно отправлено команде проекта!');
        
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.');
      } finally {
        contactLoading.value = false;
      }
    };
    
    const editStartup = () => {
      if (startup.value) {
        router.push(`/startups/edit/${startup.value.id}`);
      }
    };
    
    // Загрузка данных при монтировании компонента
    onMounted(() => {
      fetchStartupDetails();
    });
    
    return {
      startup,
      loading,
      router,
      investmentAmount,
      investLoading,
      contactMessage,
      contactLoading,
      showSuccessModal,
      isOwner,
      calculateProgress,
      formatMoney,
      formatDate,
      getStageText,
      submitInvestment,
      submitContact,
      editStartup
    };
  }
};
</script>

<style scoped>
.startup-details {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state, .not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.not-found h2 {
  margin-bottom: 16px;
  color: #343a40;
}

.not-found p {
  margin-bottom: 24px;
  color: #6c757d;
}

.details-header {
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.back-btn {
  color: #2196F3;
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #212529;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #6c757d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stage-value, .category-value, .location-value {
  font-weight: 500;
  color: #343a40;
}

.details-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.details-left, .details-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.startup-image {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.startup-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.startup-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric {
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.metric:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.metric-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.metric-value.accent {
  color: #2196F3;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2196F3;
  border-radius: 4px;
}

h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #343a40;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #343a40;
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

input:focus, textarea:focus {
  border-color: #2196F3;
  outline: none;
}

.input-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.invest-btn, .contact-btn {
  width: 100%;
}

.description {
  line-height: 1.6;
  color: #343a40;
}

.additional-text {
  line-height: 1.6;
  color: #495057;
}

.timeline {
  position: relative;
  padding-left: 28px;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 7px;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  top: 0;
  left: -28px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e9ecef;
  border: 2px solid white;
}

.timeline-item.completed .timeline-marker {
  background: #4CAF50;
}

.timeline-content h4 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #343a40;
}

.timeline-date {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
}

.team-members {
  display: grid;
  gap: 16px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info h4 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #343a40;
}

.member-position {
  font-size: 14px;
  color: #6c757d;
}

.investors-list {
  display: grid;
  gap: 16px;
}

.investor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.investor-info h4 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #343a40;
}

.investor-email {
  font-size: 14px;
  color: #6c757d;
}

.investment-info {
  text-align: right;
}

.investment-amount {
  font-weight: 600;
  color: #2196F3;
  margin-bottom: 4px;
}

.investment-date {
  font-size: 12px;
  color: #6c757d;
}

.success-modal {
  text-align: center;
  padding: 20px;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 32px;
  margin: 0 auto 16px;
}

@media (max-width: 768px) {
  .details-main {
    grid-template-columns: 1fr;
  }
  
  .details-left {
    order: 2;
  }
  
  .details-right {
    order: 1;
  }
}
</style> 