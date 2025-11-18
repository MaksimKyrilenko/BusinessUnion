<template>
  <div class="market-analytics">
    <h1>Аналитика рынка</h1>

    <div class="filters">
      <SearchBar 
        placeholder="Поиск по рынку..." 
        @search="handleSearch"
        class="market-search"
      />
      <div class="filter-options">
        <select v-model="selectedCategory" class="filter-select">
          <option value="">Все категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select v-model="timeRange" class="filter-select">
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

      <!-- Новые секции для расширенной аналитики -->
      <div class="analytics-card">
        <h2>💱 Экономические показатели</h2>
        <div class="economic-indicators" v-if="!loading.economic && economicIndicators.exchangeRates">
          <div class="indicator-section">
            <h4>Курсы валют (к USD)</h4>
            <div class="currency-grid">
              <div v-for="(rate, currency) in economicIndicators.exchangeRates?.rates || {}" :key="currency" class="currency-item">
                <span class="currency-code">{{ currency }}</span>
                <span class="currency-rate">{{ rate.toFixed(4) }}</span>
              </div>
            </div>
          </div>
          
          <div class="indicator-section">
            <h4>Криптовалюты</h4>
            <div class="crypto-grid">
              <div v-for="(crypto, name) in economicIndicators.cryptoData || {}" :key="name" class="crypto-item">
                <div class="crypto-name">{{ name.charAt(0).toUpperCase() + name.slice(1) }}</div>
                <div class="crypto-price">${{ formatNumber(crypto.price) }}</div>
                <div class="crypto-change" :class="{ positive: crypto.change24h > 0, negative: crypto.change24h < 0 }">
                  {{ crypto.change24h > 0 ? '+' : '' }}{{ crypto.change24h.toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>

          <div class="indicator-section">
            <h4>Фондовые индексы</h4>
            <div class="stock-grid">
              <div v-for="(index, name) in economicIndicators.stockIndices || {}" :key="name" class="stock-item">
                <div class="stock-name">{{ name.toUpperCase() }}</div>
                <div class="stock-price">${{ formatNumber(index.price) }}</div>
                <div class="stock-change" :class="{ positive: index.change > 0, negative: index.change < 0 }">
                  {{ index.changePercent }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading">Загрузка экономических показателей...</div>
      </div>

      <div class="analytics-card">
        <h2>🏭 Отраслевые тренды</h2>
        <div class="industry-trends" v-if="!loading.industry && industryTrends.categoryTrends">
          <div class="trends-section">
            <h4>Топ категории проектов</h4>
            <div class="category-trends">
              <div v-for="trend in industryTrends.categoryTrends || []" :key="trend.name" class="trend-item">
                <div class="trend-info">
                  <div class="trend-name">{{ trend.name }}</div>
                  <div class="trend-stats">
                    <span>{{ trend.projectCount }} проектов</span>
                    <span>ROI: {{ trend.averageRoi.toFixed(1) }}%</span>
                  </div>
                </div>
                <div class="trend-investment">{{ formatCurrency(trend.totalInvestment) }}</div>
              </div>
            </div>
          </div>

          <div class="trends-section">
            <h4>Новости рынка</h4>
            <div class="news-list">
              <div v-for="news in industryTrends.marketNews || []" :key="news.title" class="news-item">
                <div class="news-title">{{ news.title }}</div>
                <div class="news-summary">{{ news.summary }}</div>
                <div class="news-sentiment" :class="{ positive: news.sentiment > 0.5, negative: news.sentiment < -0.5 }">
                  {{ news.sentiment > 0 ? 'Позитивно' : news.sentiment < 0 ? 'Негативно' : 'Нейтрально' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading">Загрузка отраслевых трендов...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from '@/axios';
import Chart from 'chart.js/auto';
import SearchBar from '@/components/ui/SearchBar.vue';

export default {
  name: 'MarketAnalytics',
  components: {
    SearchBar
  },
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

    // Новые переменные для расширенной аналитики
    const economicIndicators = ref({
      exchangeRates: { rates: {} },
      cryptoData: {},
      stockIndices: {}
    });
    const industryTrends = ref({
      categoryTrends: [],
      marketNews: []
    });
    const loading = ref({
      economic: false,
      industry: false
    });

    const fetchData = async () => {
      try {
        // Загружаем реальные данные из API
        const [projectsResponse, statsResponse, topResponse, riskResponse, forecastResponse, economicResponse, industryResponse] = await Promise.all([
          axios.get('/projects'),
          axios.get('/business-analytics/startup-stats'),
          axios.get('/business-analytics/top-startups?limit=5'),
          axios.get('/business-analytics/risk-analysis'),
          axios.get('/business-analytics/market-forecast'),
          axios.get('/business-analytics/economic-indicators'),
          axios.get('/business-analytics/industry-trends')
        ]);

        startups.value = projectsResponse.data;
        
        // Обновляем статистику реальными данными
        const stats = statsResponse.data;
        totalStartups.value = stats.totalStartups;
        activeStartups.value = stats.activeStartups;
        totalInvestments.value = stats.totalInvestments;
        averageRoi.value = Math.round(stats.averageRoi);
        
        // Обновляем топ стартапы
        topStartups.value = topResponse.data;
        
        // Обновляем анализ рисков
        const risk = riskResponse.data;
        highRiskCount.value = risk.highRisk;
        mediumRiskCount.value = risk.mediumRisk;
        lowRiskCount.value = risk.lowRisk;
        
        // Обновляем прогноз рынка
        const forecast = forecastResponse.data;
        marketGrowth.value = forecast.marketGrowth;
        marketTrends.value = forecast.trends;
        
        // Обновляем экономические показатели
        if (economicResponse.data) {
          economicIndicators.value = economicResponse.data;
        }
        
        // Обновляем отраслевые тренды
        if (industryResponse.data) {
          industryTrends.value = industryResponse.data;
        }
        
        // Добавляем небольшую задержку для создания графиков
        setTimeout(() => {
          createCharts();
        }, 100);
      } catch (error) {
        console.error('Error fetching data:', error);
        // В случае ошибки используем моковые данные
        calculateStats();
        // Добавляем небольшую задержку для создания графиков
        setTimeout(() => {
          createCharts();
        }, 100);
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
      // Проверяем, что элементы существуют
      if (!investmentChart.value) {
        console.warn('Investment chart element not found');
        return;
      }
      
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
      if (!categoryChart.value) {
        console.warn('Category chart element not found');
        return;
      }
      
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

    const handleSearch = (query) => {
      searchQuery.value = query;
      // Добавьте здесь логику фильтрации данных по поисковому запросу
    };

    watch([selectedCategory, timeRange], () => {
      fetchData();
    });

    onMounted(() => {
      fetchData();
    });

    const formatNumber = (number) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(number);
    };

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
      economicIndicators,
      industryTrends,
      loading,
      investmentChart,
      categoryChart,
      formatCurrency,
      formatNumber,
      handleSearch
    };
  }
};
</script>

<style scoped>
.market-analytics {
  padding: 2rem;
}

.filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.market-search {
  flex: 1;
  min-width: 300px;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.filter-select {
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: #2196F3;
}

.filter-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
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

/* Новые стили для экономических показателей */
.economic-indicators {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.indicator-section {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.indicator-section h4 {
  margin: 0 0 1rem;
  color: #1e293b;
  font-size: 1rem;
}

.currency-grid, .crypto-grid, .stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.currency-item, .crypto-item, .stock-item {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.currency-code, .crypto-name, .stock-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.currency-rate, .crypto-price, .stock-price {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.crypto-change, .stock-change {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.crypto-change.positive, .stock-change.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.crypto-change.negative, .stock-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Стили для отраслевых трендов */
.industry-trends {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.trends-section {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.trends-section h4 {
  margin: 0 0 1rem;
  color: #1e293b;
  font-size: 1rem;
}

.category-trends {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.trend-info {
  flex: 1;
}

.trend-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.trend-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
}

.trend-investment {
  font-weight: 600;
  color: #16a34a;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.news-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.news-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.news-summary {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.news-sentiment {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.news-sentiment.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.news-sentiment.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.news-sentiment:not(.positive):not(.negative) {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-style: italic;
}
</style> 