<template>
  <div class="application-success">
    <div class="success-content">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      
      <h1>Заявка успешно отправлена!</h1>
      
      <p class="message">
        Спасибо за вашу заявку. Мы рассмотрим её в ближайшее время и свяжемся с вами.
      </p>
      
      <div class="next-steps">
        <h2>Следующие шаги</h2>
        
        <div class="steps-list">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Проверка заявки</h3>
              <p>Наша команда проверит вашу заявку на соответствие требованиям гранта.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Рассмотрение</h3>
              <p>Заявка будет рассмотрена экспертной комиссией в течение 30 дней.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Решение</h3>
              <p>Вы получите уведомление о решении комиссии по электронной почте.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <BaseButton 
          variant="primary"
          @click="goToGrants"
        >
          Вернуться к грантам
        </BaseButton>
        
        <BaseButton 
          variant="secondary"
          @click="goToDashboard"
        >
          Перейти в личный кабинет
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'ApplicationSuccess',
  components: {
    BaseButton
  },
  methods: {
    goToGrants() {
      this.$router.push('/grants')
    },
    goToDashboard() {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.application-success {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
}

.success-content {
  background: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.success-icon {
  font-size: 64px;
  color: #2e7d32;
  margin-bottom: 20px;
}

.success-icon i {
  animation: scale-in 0.5s ease-out;
}

h1 {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 28px;
}

.message {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.next-steps {
  text-align: left;
  margin-bottom: 30px;
}

.next-steps h2 {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 20px;
}

.steps-list {
  display: grid;
  gap: 20px;
}

.step {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 5px;
  color: #2c3e50;
  font-size: 16px;
}

.step-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .success-content {
    padding: 30px 20px;
  }
  
  .success-icon {
    font-size: 48px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions button {
    width: 100%;
  }
}
</style> 