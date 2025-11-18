<template>
  <div class="investment-form">
    <h2>Инвестировать в проект</h2>
    <div class="project-info">
      <h3>{{ project.title }}</h3>
      <div class="investment-details">
        <div class="detail">
          <span class="label">Требуется:</span>
          <span class="value">{{ formatMoney(project.investmentNeeded) }}</span>
        </div>
        <div class="detail">
          <span class="label">Собрано:</span>
          <span class="value">{{ formatMoney(project.investmentCollected) }}</span>
        </div>
        <div class="detail">
          <span class="label">Осталось:</span>
          <span class="value">{{ formatMoney(remainingAmount) }}</span>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Сумма инвестиций (₽)</label>
        <input 
          type="number" 
          v-model="amount"
          required
          :min="minInvestment"
          :max="remainingAmount"
          step="1000"
        >
        <div class="amount-hints">
          <span>Мин: {{ formatMoney(minInvestment) }}</span>
          <span>Макс: {{ formatMoney(remainingAmount) }}</span>
        </div>
      </div>

      <div class="investment-summary">
        <h4>Детали инвестиции</h4>
        <div class="summary-item">
          <span>Сумма инвестиций:</span>
          <span>{{ formatMoney(amount) }}</span>
        </div>
        <div class="summary-item">
          <span>Ожидаемый ROI:</span>
          <span>{{ project.expectedRoi }}%</span>
        </div>
        <div class="summary-item">
          <span>Потенциальный доход:</span>
          <span>{{ formatMoney(expectedReturn) }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>
          <input 
            type="checkbox" 
            v-model="agreementAccepted"
            required
          >
          Я согласен с условиями инвестирования и осознаю возможные риски
        </label>
      </div>

      <div class="form-actions">
        <BaseButton 
          type="submit"
          :disabled="!isValid"
        >
          Инвестировать
        </BaseButton>
        <BaseButton 
          type="button" 
          variant="secondary" 
          @click="$emit('cancel')"
        >
          Отмена
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'InvestmentForm',
  components: {
    BaseButton
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      amount: this.project.minInvestment || 10000,
      agreementAccepted: false
    }
  },
  computed: {
    minInvestment() {
      return this.project.minInvestment || 10000
    },
    remainingAmount() {
      return this.project.investmentNeeded - this.project.investmentCollected
    },
    expectedReturn() {
      return this.amount * (1 + this.project.expectedRoi / 100)
    },
    isValid() {
      return this.amount >= this.minInvestment &&
             this.amount <= this.remainingAmount &&
             this.agreementAccepted
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    handleSubmit() {
      if (!this.isValid) return

      this.$emit('submit', {
        projectId: this.project.id,
        amount: this.amount
      })
    }
  }
}
</script>

<style scoped>
.investment-form {
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.project-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.investment-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.detail {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.9em;
  color: #666;
}

.value {
  font-weight: 500;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.amount-hints {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.investment-summary {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

input[type="checkbox"] {
  margin-right: 8px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

input[type="number"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style> 