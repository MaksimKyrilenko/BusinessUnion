<template>
  <div class="startup-analysis">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <div v-else-if="startup" class="analysis-content">
      <div class="header">
        <h1>{{ startup.title }}</h1>
        <div class="status-badge" :class="startup.status">
          {{ getStatusText(startup.status) }}
        </div>
      </div>

      <div class="main-info">
        <div class="image-section">
          <img :src="startup.image || '/placeholder.jpg'" :alt="startup.title" class="startup-image">
        </div>
        <div class="info-section">
          <h2>Основная информация</h2>
          <p class="description">{{ startup.description }}</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Требуемые инвестиции</div>
              <div class="stat-value">{{ formatCurrency(startup.investmentNeeded) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Собрано</div>
              <div class="stat-value">{{ formatCurrency(startup.investmentCollected) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Ожидаемая ROI</div>
              <div class="stat-value">{{ startup.expectedRoi }}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Осталось собрать</div>
              <div class="stat-value">{{ formatCurrency(startup.investmentNeeded - startup.investmentCollected) }}</div>
            </div>
          </div>

          <div class="progress-bar">
            <div 
              class="progress"
              :style="{ width: `${(startup.investmentCollected / startup.investmentNeeded) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="analysis-sections">
        <div class="section">
          <h2>Анализ команды</h2>
          <div class="team-analysis">
            <div class="analysis-item">
              <div class="item-label">Наличие команды</div>
              <div class="item-value" :class="{ positive: startup.additionalInfo.hasTeam }">
                {{ startup.additionalInfo.hasTeam ? 'Да' : 'Нет' }}
              </div>
            </div>
            <div class="analysis-item">
              <div class="item-label">Наличие MVP</div>
              <div class="item-value" :class="{ positive: startup.additionalInfo.hasMVP }">
                {{ startup.additionalInfo.hasMVP ? 'Да' : 'Нет' }}
              </div>
            </div>
            <div class="analysis-item">
              <div class="item-label">Бизнес-план</div>
              <div class="item-value" :class="{ positive: startup.additionalInfo.hasBusinessPlan }">
                {{ startup.additionalInfo.hasBusinessPlan ? 'Да' : 'Нет' }}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Финансовый анализ</h2>
          <div class="financial-analysis">
            <div class="chart-container">
              <canvas ref="roiChart"></canvas>
            </div>
            <div class="financial-metrics">
              <div class="metric">
                <div class="metric-label">ROI</div>
                <div class="metric-value">{{ startup.expectedRoi }}%</div>
                <div class="metric-description">Ожидаемая доходность инвестиций</div>
              </div>
              <div class="metric">
                <div class="metric-label">Срок окупаемости</div>
                <div class="metric-value">{{ calculatePaybackPeriod() }} мес.</div>
                <div class="metric-description">Расчетный период возврата инвестиций</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Риски и возможности</h2>
          <div class="risks-opportunities">
            <div class="risks">
              <h3>Риски</h3>
              <ul>
                <li>Отсутствие команды</li>
                <li>Нет MVP</li>
                <li>Отсутствие бизнес-плана</li>
                <li>Высокая конкуренция в отрасли</li>
              </ul>
            </div>
            <div class="opportunities">
              <h3>Возможности</h3>
              <ul>
                <li>Растущий рынок</li>
                <li>Инновационное решение</li>
                <li>Потенциально высокая ROI</li>
                <li>Масштабируемость бизнеса</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          @click="invest"
          class="btn btn-primary"
          :disabled="startup.status !== 'active'"
        >
          Инвестировать
        </button>
        <button @click="back" class="btn btn-secondary">
          Назад
        </button>
      </div>
    </div>

    <div v-else class="error">
      <p>Не удалось загрузить данные о стартапе</p>
      <button @click="back" class="btn btn-primary">
        Назад
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/axios';
import Chart from 'chart.js/auto';

export default {
  name: 'StartupAnalysis',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const startup = ref(null);
    const loading = ref(true);
    const roiChart = ref(null);

    const fetchStartup = async () => {
      try {
        const response = await axios.get(`/projects/${route.params.id}`);
        startup.value = response.data;
        createChart();
      } catch (error) {
        console.error('Error fetching startup:', error);
      } finally {
        loading.value = false;
      }
    };

    const createChart = () => {
      const ctx = roiChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Месяц 1', 'Месяц 3', 'Месяц 6', 'Месяц 12', 'Месяц 24'],
          datasets: [{
            label: 'ROI',
            data: [0, 5, 15, 30, startup.value.expectedRoi],
            borderColor: '#28a745',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Прогноз ROI'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'ROI (%)'
              }
            }
          }
        }
      });
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
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

    const calculatePaybackPeriod = () => {
      if (!startup.value) return 0;
      const monthlyRoi = startup.value.expectedRoi / 12;
      return Math.ceil(100 / monthlyRoi);
    };

    const invest = () => {
      router.push(`/startup/${route.params.id}/invest`);
    };

    const back = () => {
      router.push('/investor/startup-catalog');
    };

    onMounted(fetchStartup);

    return {
      startup,
      loading,
      roiChart,
      formatCurrency,
      getStatusText,
      calculatePaybackPeriod,
      invest,
      back
    };
  }
};
</script>

<style scoped>
.startup-analysis {
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.main-info {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.startup-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.stat-card {
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
  margin: 1rem 0;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.analysis-sections {
  display: grid;
  gap: 2rem;
}

.section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.team-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.item-value.positive {
  color: #28a745;
}

.chart-container {
  height: 300px;
  margin-bottom: 1rem;
}

.financial-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.metric-description {
  color: #666;
  font-size: 0.875rem;
}

.risks-opportunities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.risks h3, .opportunities h3 {
  color: #666;
  margin-bottom: 1rem;
}

.risks ul, .opportunities ul {
  list-style: none;
  padding: 0;
}

.risks li, .opportunities li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  text-align: center;
  padding: 3rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
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
</style> 