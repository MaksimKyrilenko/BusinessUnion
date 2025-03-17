<template>
  <div class="market-analytics">
    <h1>Аналитика рынка</h1>

    <div class="filters">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск по рынку..."
          class="form-control"
        />
      </div>
      <div class="filter-options">
        <select v-model="selectedCategory" class="form-control">
          <option value="">Все категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select v-model="timeRange" class="form-control">
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="quarter">Квартал</option>
          <option value="year">Год</option>
        </select>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="analytics-card">
        <h2>Общая статистика</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Всего стартапов</div>
            <div class="stat-value">{{ totalStartups }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Активные проекты</div>
            <div class="stat-value">{{ activeStartups }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Общий объем инвестиций</div>
            <div class="stat-value">{{ formatCurrency(totalInvestments) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Средняя ROI</div>
            <div class="stat-value">{{ averageRoi }}%</div>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Тренды инвестиций</h2>
        <div class="chart-container">
          <canvas ref="investmentChart"></canvas>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Распределение по категориям</h2>
        <div class="chart-container">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Топ-5 стартапов</h2>
        <div class="top-startups">
          <div v-for="startup in topStartups" :key="startup.id" class="startup-item">
            <div class="startup-info">
              <h3>{{ startup.title }}</h3>
              <p class="category">{{ startup.category.name }}</p>
            </div>
            <div class="startup-stats">
              <div class="stat">
                <span class="label">ROI</span>
                <span class="value">{{ startup.expectedRoi }}%</span>
              </div>
              <div class="stat">
                <span class="label">Инвестиции</span>
                <span class="value">{{ formatCurrency(startup.investmentNeeded) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Анализ рисков</h2>
        <div class="risk-analysis">
          <div class="risk-item">
            <div class="risk-label">Высокий риск</div>
            <div class="risk-value">{{ highRiskCount }}</div>
            <div class="risk-bar">
              <div 
                class="risk-progress"
                :style="{ width: `${(highRiskCount / totalStartups) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-label">Средний риск</div>
            <div class="risk-value">{{ mediumRiskCount }}</div>
            <div class="risk-bar">
              <div 
                class="risk-progress"
                :style="{ width: `${(mediumRiskCount / totalStartups) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-label">Низкий риск</div>
            <div class="risk-value">{{ lowRiskCount }}</div>
            <div class="risk-bar">
              <div 
                class="risk-progress"
                :style="{ width: `${(lowRiskCount / totalStartups) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <h2>Прогноз рынка</h2>
        <div class="market-forecast">
          <div class="forecast-item">
            <div class="forecast-label">Рост рынка</div>
            <div class="forecast-value positive">+{{ marketGrowth }}%</div>
            <div class="forecast-description">Прогнозируемый рост за следующий период</div>
          </div>
          <div class="forecast-item">
            <div class="forecast-label">Тренды</div>
            <ul class="trends-list">
              <li v-for="(trend, index) in marketTrends" :key="index">
                {{ trend }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from '@/axios';
import Chart from 'chart.js/auto';

export default {
  name: 'MarketAnalytics',
  setup() {
    const categories = ref([]);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const timeRange = ref('month');
    const startups = ref([]);
    const investmentChart = ref(null);
    const categoryChart = ref(null);

    const totalStartups = ref(0);
    const activeStartups = ref(0);
    const totalInvestments = ref(0);
    const averageRoi = ref(0);
    const topStartups = ref([]);
    const highRiskCount = ref(0);
    const mediumRiskCount = ref(0);
    const lowRiskCount = ref(0);
    const marketGrowth = ref(15);
    const marketTrends = ref([
      'Рост инвестиций в AI и ML',
      'Развитие экологических проектов',
      'Увеличение интереса к Web3',
      'Фокус на кибербезопасности'
    ]);

    const fetchData = async () => {
      try {
        const response = await axios.get('/projects');
        startups.value = response.data;
        calculateStats();
        createCharts();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const calculateStats = () => {
      totalStartups.value = startups.value.length;
      activeStartups.value = startups.value.filter(s => s.status === 'active').length;
      totalInvestments.value = startups.value.reduce((sum, s) => sum + s.investmentNeeded, 0);
      averageRoi.value = Math.round(
        startups.value.reduce((sum, s) => sum + s.expectedRoi, 0) / totalStartups.value
      );

      // Расчет рисков
      highRiskCount.value = startups.value.filter(s => s.expectedRoi > 50).length;
      mediumRiskCount.value = startups.value.filter(s => s.expectedRoi > 20 && s.expectedRoi <= 50).length;
      lowRiskCount.value = startups.value.filter(s => s.expectedRoi <= 20).length;

      // Топ-5 стартапов по ROI
      topStartups.value = [...startups.value]
        .sort((a, b) => b.expectedRoi - a.expectedRoi)
        .slice(0, 5);
    };

    const createCharts = () => {
      // График инвестиций
      const investmentCtx = investmentChart.value.getContext('2d');
      new Chart(investmentCtx, {
        type: 'line',
        data: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
          datasets: [{
            label: 'Объем инвестиций',
            data: [1000000, 1500000, 2000000, 1800000, 2500000, 3000000],
            borderColor: '#007bff',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Динамика инвестиций'
            }
          }
        }
      });

      // График категорий
      const categoryCtx = categoryChart.value.getContext('2d');
      new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: ['Технологии', 'Финансы', 'Здравоохранение', 'Образование', 'Другое'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#007bff',
              '#28a745',
              '#ffc107',
              '#dc3545',
              '#6c757d'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Распределение по категориям'
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

    watch([selectedCategory, timeRange], () => {
      fetchData();
    });

    onMounted(() => {
      fetchData();
    });

    return {
      categories,
      searchQuery,
      selectedCategory,
      timeRange,
      totalStartups,
      activeStartups,
      totalInvestments,
      averageRoi,
      topStartups,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      marketGrowth,
      marketTrends,
      investmentChart,
      categoryChart,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.market-analytics {
  padding: 2rem;
}

.filters {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.analytics-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analytics-card h2 {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
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
  font-size: 1.5rem;
  font-weight: 600;
}

.chart-container {
  height: 300px;
}

.top-startups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.startup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.startup-info h3 {
  margin: 0;
  font-size: 1rem;
}

.category {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.startup-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  text-align: right;
}

.stat .label {
  display: block;
  color: #666;
  font-size: 0.875rem;
}

.stat .value {
  font-weight: 600;
}

.risk-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.risk-label {
  width: 100px;
  color: #666;
}

.risk-value {
  width: 50px;
  font-weight: 600;
}

.risk-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.risk-progress {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.market-forecast {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.forecast-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.forecast-label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.forecast-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.forecast-value.positive {
  color: #28a745;
}

.forecast-description {
  color: #666;
  font-size: 0.875rem;
}

.trends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trends-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.trends-list li:last-child {
  border-bottom: none;
}
</style> 