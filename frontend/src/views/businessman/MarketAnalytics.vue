<template>
  <div class="market-analytics">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-chart-bar"></i>
          <span>Бизнесмену</span>
        </div>
        <h1 class="header-title">Бизнес аналитика</h1>
        <p class="header-subtitle">Статистика и тренды рынка для вашего бизнеса</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-rocket"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ totalStartups }}</span>
            <span class="stat-label">Стартапов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ activeStartups }}</span>
            <span class="stat-label">Активных</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-percentage"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ averageRoi }}%</span>
            <span class="stat-label">Средний ROI</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 1: Stats + Investment Chart -->
    <div class="row row-2">
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

      <div class="analytics-card card-wide">
        <h2>Тренды инвестиций</h2>
        <div class="chart-container">
          <canvas ref="investmentChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 2: Categories + Top Startups -->
    <div class="row row-2">
      <div class="analytics-card">
        <h2>Распределение по категориям</h2>
        <div class="chart-container chart-small">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>

      <div class="analytics-card card-wide">
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
    </div>

    <!-- Row 3: Risk + Forecast -->
    <div class="row row-2-equal">
      <div class="analytics-card">
        <h2>Анализ рисков</h2>
        <div class="risk-analysis">
          <div class="risk-item">
            <div class="risk-label">Высокий риск</div>
            <div class="risk-value">{{ highRiskCount }}</div>
            <div class="risk-bar">
              <div class="risk-progress" :style="{ width: `${(highRiskCount / totalStartups) * 100}%` }"></div>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-label">Средний риск</div>
            <div class="risk-value">{{ mediumRiskCount }}</div>
            <div class="risk-bar">
              <div class="risk-progress" :style="{ width: `${(mediumRiskCount / totalStartups) * 100}%` }"></div>
            </div>
          </div>
          <div class="risk-item">
            <div class="risk-label">Низкий риск</div>
            <div class="risk-value">{{ lowRiskCount }}</div>
            <div class="risk-bar">
              <div class="risk-progress" :style="{ width: `${(lowRiskCount / totalStartups) * 100}%` }"></div>
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
              <li v-for="(trend, index) in marketTrends" :key="index">{{ trend }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Economic Indicators (full width) -->
    <div class="row row-full">
      <div class="analytics-card">
        <h2>💱 Экономические показатели</h2>
        <div class="economic-indicators" v-if="!loading.economic && economicIndicators.exchangeRates">
          <div class="indicators-row">
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
        </div>
        <div v-else class="loading">Загрузка экономических показателей...</div>
      </div>
    </div>

    <!-- Row 5: Industry Trends (full width) -->
    <div class="row row-full">
      <div class="analytics-card">
        <h2>🏭 Отраслевые тренды</h2>
        <div class="industry-trends" v-if="!loading.industry && industryTrends.categoryTrends">
          <div class="trends-row">
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
/* Base */
.market-analytics {
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
.page-header-blue .header-left { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
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
.page-header-blue .header-subtitle { font-size: 0.95rem; opacity: 0.85; margin: 0; color: #fff !important; }
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
.page-header-blue .stat-number { font-size: 1.25rem; font-weight: 700; line-height: 1; color: #fff !important; }
.page-header-blue .stat-label { font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; color: #fff !important; text-transform: none !important; letter-spacing: normal !important; }

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1E6BFF, #5B8DEF);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 8px 32px rgba(30, 107, 255, 0.3);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-selector {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.period-btn:hover {
  color: #1e293b;
  background: #e2e8f0;
}

.period-btn.active {
  background: #1E6BFF;
  color: white;
}

/* Filters */
.filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  background: #FFFFFF;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.market-search {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  min-width: 140px;
  padding: 0.5rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: #1E6BFF;
}

.filter-select:focus {
  outline: none;
  border-color: #1E6BFF;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(30, 107, 255, 0.1);
}

/* Row Layout */
.row {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.row-2 {
  grid-template-columns: 1fr 2fr;
}

.row-2-equal {
  grid-template-columns: 1fr 1fr;
}

.row-full {
  grid-template-columns: 1fr;
}

/* Cards */
.analytics-card {
  background: #FFFFFF;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.analytics-card:hover {
  box-shadow: 0 4px 12px rgba(30, 107, 255, 0.08);
  border-color: #1E6BFF;
}

.analytics-card h2 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.analytics-card h2::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #1E6BFF;
  border-radius: 2px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.stat-item {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stat-item:hover {
  border-color: #1E6BFF;
  background: #f0f7ff;
}

.stat-label {
  color: #64748b;
  font-size: 0.65rem;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

/* Chart */
.chart-container {
  height: 180px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.5rem;
}

.chart-small {
  height: 200px;
}

/* Top Startups */
.top-startups {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.startup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.startup-item:hover {
  border-color: #1E6BFF;
  background: #FFFFFF;
}

.startup-info h3 {
  margin: 0 0 0.1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
}

.category {
  color: #64748b;
  font-size: 0.65rem;
  margin: 0;
}

.startup-stats {
  display: flex;
  gap: 0.75rem;
}

.stat {
  text-align: right;
}

.stat .label {
  display: block;
  color: #94a3b8;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.05rem;
}

.stat .value {
  font-weight: 600;
  font-size: 0.75rem;
  color: #1E6BFF;
}

/* Risk Analysis */
.risk-analysis {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  background: #f8fafc;
  border-radius: 6px;
}

.risk-label {
  width: 85px;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500;
}

.risk-value {
  width: 30px;
  font-weight: 700;
  font-size: 0.8rem;
  color: #1e293b;
}

.risk-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.risk-progress {
  height: 100%;
  background: linear-gradient(90deg, #1E6BFF, #5B8DEF);
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* Market Forecast */
.market-forecast {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.forecast-item {
  background: #f8fafc;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.forecast-label {
  color: #64748b;
  font-size: 0.65rem;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.forecast-value {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.15rem;
  color: #1e293b;
}

.forecast-value.positive {
  color: #10b981;
}

.forecast-description {
  color: #94a3b8;
  font-size: 0.7rem;
}

.trends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trends-list li {
  padding: 0.35rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.75rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.trends-list li::before {
  content: '';
  width: 4px;
  height: 4px;
  background: #1E6BFF;
  border-radius: 50%;
}

.trends-list li:last-child {
  border-bottom: none;
}

/* Economic Indicators */
.economic-indicators {
  display: flex;
  flex-direction: column;
}

.indicators-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.indicator-section {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.indicator-section h4 {
  margin: 0 0 0.5rem;
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: 600;
}

.currency-grid, .crypto-grid, .stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 0.4rem;
}

.currency-item, .crypto-item, .stock-item {
  background: #FFFFFF;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
  transition: all 0.2s ease;
}

.currency-item:hover, .crypto-item:hover, .stock-item:hover {
  border-color: #1E6BFF;
}

.currency-code, .crypto-name, .stock-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.7rem;
  margin-bottom: 0.1rem;
}

.currency-rate, .crypto-price, .stock-price {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.1rem;
}

.crypto-change, .stock-change {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  display: inline-block;
}

.crypto-change.positive, .stock-change.positive {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.crypto-change.negative, .stock-change.negative {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

/* Industry Trends */
.industry-trends {
  display: flex;
  flex-direction: column;
}

.trends-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.trends-section {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.trends-section h4 {
  margin: 0 0 0.5rem;
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-trends {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.trend-item:hover {
  border-color: #1E6BFF;
}

.trend-info {
  flex: 1;
}

.trend-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.1rem;
  font-size: 0.75rem;
}

.trend-stats {
  display: flex;
  gap: 0.5rem;
  font-size: 0.65rem;
  color: #64748b;
}

.trend-investment {
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

/* News */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.news-item {
  background: #FFFFFF;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.news-item:hover {
  border-color: #1E6BFF;
}

.news-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.15rem;
  font-size: 0.75rem;
}

.news-summary {
  color: #64748b;
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
  line-height: 1.35;
}

.news-sentiment {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  display: inline-block;
}

.news-sentiment.positive {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.news-sentiment.negative {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.news-sentiment:not(.positive):not(.negative) {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
}

/* Loading */
.loading {
  text-align: center;
  padding: 1rem;
  color: #94a3b8;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .row-2 {
    grid-template-columns: 1fr;
  }
  
  .row-2-equal {
    grid-template-columns: 1fr;
  }
  
  .indicators-row {
    grid-template-columns: 1fr;
  }
  
  .trends-row {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .market-analytics {
    padding: 0.75rem;
  }
  
  .page-header-blue {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
  }
  .page-header-blue .header-title { font-size: 1.35rem; }
  .page-header-blue .header-stats { width: 100%; }
  .page-header-blue .stat-card { flex: 1; min-width: 90px; }
  
  .period-selector {
    flex-wrap: wrap;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .market-search {
    min-width: auto;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .startup-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
  
  .startup-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 