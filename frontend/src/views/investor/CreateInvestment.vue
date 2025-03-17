<template>
  <div class="create-investment">
    <h1>Создание инвестиции</h1>

    <div class="project-info" v-if="project">
      <div class="project-header">
        <h2>{{ project.title }}</h2>
        <span class="category">{{ project.category.name }}</span>
      </div>
      <div class="project-stats">
        <div class="stat-item">
          <div class="stat-label">Требуемые инвестиции</div>
          <div class="stat-value">{{ formatCurrency(project.investmentNeeded) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Ожидаемая ROI</div>
          <div class="stat-value">{{ project.expectedRoi }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Собрано инвестиций</div>
          <div class="stat-value">{{ formatCurrency(project.currentInvestment) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Осталось собрать</div>
          <div class="stat-value">{{ formatCurrency(project.investmentNeeded - project.currentInvestment) }}</div>
        </div>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${(project.currentInvestment / project.investmentNeeded) * 100}%` }"
        ></div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="investment-form">
      <div class="form-group">
        <label for="amount">Сумма инвестиции</label>
        <div class="input-group">
          <input
            type="number"
            id="amount"
            v-model="form.amount"
            class="form-control"
            :min="minInvestment"
            :max="maxInvestment"
            required
          />
          <span class="input-group-text">₽</span>
        </div>
        <div class="form-text">
          Минимальная сумма: {{ formatCurrency(minInvestment) }}<br>
          Максимальная сумма: {{ formatCurrency(maxInvestment) }}
        </div>
      </div>

      <div class="form-group">
        <label for="comment">Комментарий (необязательно)</label>
        <textarea
          id="comment"
          v-model="form.comment"
          class="form-control"
          rows="3"
          placeholder="Опишите причины инвестиции..."
        ></textarea>
      </div>

      <div class="investment-summary">
        <h3>Сводка инвестиции</h3>
        <div class="summary-item">
          <span>Сумма инвестиции:</span>
          <span>{{ formatCurrency(form.amount) }}</span>
        </div>
        <div class="summary-item">
          <span>Ожидаемая ROI:</span>
          <span>{{ project?.expectedRoi }}%</span>
        </div>
        <div class="summary-item">
          <span>Ожидаемый доход:</span>
          <span>{{ formatCurrency(expectedReturn) }}</span>
        </div>
        <div class="summary-item">
          <span>Срок окупаемости:</span>
          <span>{{ paybackPeriod }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="goBack"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Создание...' : 'Создать инвестицию' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/axios';

export default {
  name: 'CreateInvestment',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const project = ref(null);
    const loading = ref(false);

    const form = ref({
      amount: 0,
      comment: ''
    });

    const minInvestment = computed(() => {
      return project.value?.minInvestment || 100000;
    });

    const maxInvestment = computed(() => {
      if (!project.value) return 0;
      return Math.min(
        project.value.investmentNeeded - project.value.currentInvestment,
        10000000
      );
    });

    const expectedReturn = computed(() => {
      if (!project.value || !form.value.amount) return 0;
      return form.value.amount * (project.value.expectedRoi / 100);
    });

    const paybackPeriod = computed(() => {
      if (!project.value || !form.value.amount) return 'Недостаточно данных';
      const months = Math.ceil(100 / project.value.expectedRoi * 12);
      return `${months} мес.`;
    });

    const fetchProject = async () => {
      try {
        const response = await axios.get(`/projects/${route.params.id}`);
        project.value = response.data;
      } catch (error) {
        console.error('Error fetching project:', error);
        router.push('/investor/startup-catalog');
      }
    };

    const handleSubmit = async () => {
      if (form.value.amount < minInvestment.value) {
        alert(`Минимальная сумма инвестиции: ${formatCurrency(minInvestment.value)}`);
        return;
      }

      if (form.value.amount > maxInvestment.value) {
        alert(`Максимальная сумма инвестиции: ${formatCurrency(maxInvestment.value)}`);
        return;
      }

      loading.value = true;
      try {
        await axios.post('/investments', {
          amount: form.value.amount,
          projectId: project.value.id,
          comment: form.value.comment
        });
        router.push('/investor/investments');
      } catch (error) {
        console.error('Error creating investment:', error);
        alert('Произошла ошибка при создании инвестиции');
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount);
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchProject();
    });

    return {
      project,
      form,
      loading,
      minInvestment,
      maxInvestment,
      expectedReturn,
      paybackPeriod,
      handleSubmit,
      formatCurrency,
      goBack
    };
  }
};
</script>

<style scoped>
.create-investment {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.project-info {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.project-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.investment-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-group {
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.input-group-text {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 4px 4px 0;
}

.form-text {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.investment-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.investment-summary h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style> 