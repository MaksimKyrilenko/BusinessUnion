<template>
  <div class="businessman-dashboard">
    <div class="dashboard-grid">
      <!-- Статистика стартапов -->
      <div class="dashboard-card">
        <h2>📊 Статистика стартапов</h2>
        <div class="card-content" v-if="!loading.stats">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ startupStats.totalStartups }}</div>
              <div class="stat-label">Всего стартапов</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ startupStats.activeStartups }}</div>
              <div class="stat-label">Активных</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(startupStats.totalInvestments) }}</div>
              <div class="stat-label">Общий объем инвестиций</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ startupStats.averageRoi }}%</div>
              <div class="stat-label">Средняя ROI</div>
            </div>
          </div>
        </div>
        <div v-else class="loading">Загрузка статистики...</div>
      </div>
      
      <!-- Топ стартапы -->
      <div class="dashboard-card">
        <h2>🏆 Топ стартапы</h2>
        <div class="card-content" v-if="!loading.topStartups">
          <div class="top-startups-list">
            <div v-for="startup in topStartups" :key="startup.id" class="startup-item">
              <div class="startup-info">
                <h4>{{ startup.title }}</h4>
                <p class="category">{{ startup.category.name }}</p>
              </div>
              <div class="startup-roi">{{ startup.expectedRoi }}% ROI</div>
            </div>
          </div>
        </div>
        <div v-else class="loading">Загрузка топ стартапов...</div>
      </div>

      <!-- Анализ рисков -->
      <div class="dashboard-card">
        <h2>⚠️ Анализ рисков</h2>
        <div class="card-content" v-if="!loading.riskAnalysis">
          <div class="risk-analysis">
            <div class="risk-item">
              <div class="risk-label">Высокий риск</div>
              <div class="risk-value">{{ riskAnalysis.highRisk }}</div>
              <div class="risk-bar">
                <div class="risk-progress high-risk" :style="{ width: `${(riskAnalysis.highRisk / (riskAnalysis.highRisk + riskAnalysis.mediumRisk + riskAnalysis.lowRisk)) * 100}%` }"></div>
              </div>
            </div>
            <div class="risk-item">
              <div class="risk-label">Средний риск</div>
              <div class="risk-value">{{ riskAnalysis.mediumRisk }}</div>
              <div class="risk-bar">
                <div class="risk-progress medium-risk" :style="{ width: `${(riskAnalysis.mediumRisk / (riskAnalysis.highRisk + riskAnalysis.mediumRisk + riskAnalysis.lowRisk)) * 100}%` }"></div>
              </div>
            </div>
            <div class="risk-item">
              <div class="risk-label">Низкий риск</div>
              <div class="risk-value">{{ riskAnalysis.lowRisk }}</div>
              <div class="risk-bar">
                <div class="risk-progress low-risk" :style="{ width: `${(riskAnalysis.lowRisk / (riskAnalysis.highRisk + riskAnalysis.mediumRisk + riskAnalysis.lowRisk)) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading">Загрузка анализа рисков...</div>
      </div>

      <!-- Прогноз рынка -->
      <div class="dashboard-card">
        <h2>📈 Прогноз рынка</h2>
        <div class="card-content" v-if="!loading.forecast">
          <div class="forecast-content">
            <div class="growth-indicator">
              <div class="growth-value positive">+{{ marketForecast.marketGrowth }}%</div>
              <div class="growth-label">Прогнозируемый рост</div>
            </div>
            <div class="trends">
              <h4>Ключевые тренды:</h4>
              <ul>
                <li v-for="trend in marketForecast.trends" :key="trend">{{ trend }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div v-else class="loading">Загрузка прогноза...</div>
      </div>

      <!-- Экономические показатели -->
      <div class="dashboard-card">
        <h2>💱 Экономические показатели</h2>
        <div class="card-content" v-if="!loading.economic">
          <div class="economic-indicators">
            <div class="indicator-section">
              <h4>Курсы валют (к USD)</h4>
              <div class="currency-grid">
                <div v-for="(rate, currency) in economicIndicators.exchangeRates.rates" :key="currency" class="currency-item">
                  <span class="currency-code">{{ currency }}</span>
                  <span class="currency-rate">{{ rate.toFixed(4) }}</span>
                </div>
              </div>
            </div>
            
            <div class="indicator-section">
              <h4>Криптовалюты</h4>
              <div class="crypto-grid">
                <div v-for="(crypto, name) in economicIndicators.cryptoData" :key="name" class="crypto-item">
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
                <div v-for="(index, name) in economicIndicators.stockIndices" :key="name" class="stock-item">
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

      <!-- Отраслевые тренды -->
      <div class="dashboard-card">
        <h2>🏭 Отраслевые тренды</h2>
        <div class="card-content" v-if="!loading.industry">
          <div class="industry-trends">
            <div class="trends-section">
              <h4>Топ категории проектов</h4>
              <div class="category-trends">
                <div v-for="trend in industryTrends.categoryTrends" :key="trend.name" class="trend-item">
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
                <div v-for="news in industryTrends.marketNews" :key="news.title" class="news-item">
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
import { defineComponent, ref, onMounted } from 'vue'
import { MarketAnalyticsService } from '@/services/marketAnalytics.service'

export default defineComponent({
  name: 'BusinessmanDashboard',
  setup() {
    const startupStats = ref({})
    const topStartups = ref([])
    const riskAnalysis = ref({})
    const marketForecast = ref({})
    const economicIndicators = ref({})
    const industryTrends = ref({})
    const loading = ref({
      stats: false,
      topStartups: false,
      riskAnalysis: false,
      forecast: false,
      economic: false,
      industry: false
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    }

    const formatNumber = (number) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(number)
    }

    const loadData = async () => {
      try {
        // Загружаем все данные параллельно
        loading.value.stats = true
        loading.value.topStartups = true
        loading.value.riskAnalysis = true
        loading.value.forecast = true
        loading.value.economic = true
        loading.value.industry = true

        const [stats, top, risk, forecast, economic, industry] = await Promise.all([
          MarketAnalyticsService.getStartupStatistics(),
          MarketAnalyticsService.getTopStartups(5),
          MarketAnalyticsService.getRiskAnalysis(),
          MarketAnalyticsService.getMarketForecast(),
          MarketAnalyticsService.getEconomicIndicators(),
          MarketAnalyticsService.getIndustryTrends()
        ])

        startupStats.value = stats
        topStartups.value = top
        riskAnalysis.value = risk
        marketForecast.value = forecast
        economicIndicators.value = economic
        industryTrends.value = industry
      } catch (error) {
        console.error('Ошибка загрузки данных бизнес-аналитики:', error)
      } finally {
        loading.value.stats = false
        loading.value.topStartups = false
        loading.value.riskAnalysis = false
        loading.value.forecast = false
        loading.value.economic = false
        loading.value.industry = false
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      startupStats,
      topStartups,
      riskAnalysis,
      marketForecast,
      economicIndicators,
      industryTrends,
      loading,
      formatCurrency,
      formatNumber
    }
  }
})
</script>

<style scoped>
.businessman-dashboard {
  margin-top: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
}

.dashboard-card h2 {
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
}

.top-startups-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.startup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.startup-info h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #1e293b;
}

.category {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.startup-roi {
  font-weight: 600;
  color: #16a34a;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
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
  color: #64748b;
  font-size: 0.875rem;
}

.risk-value {
  width: 50px;
  font-weight: 600;
  color: #1e293b;
}

.risk-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.risk-progress {
  height: 100%;
  transition: width 0.3s ease;
}

.risk-progress.high-risk {
  background: #dc2626;
}

.risk-progress.medium-risk {
  background: #f59e0b;
}

.risk-progress.low-risk {
  background: #16a34a;
}

.forecast-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.growth-indicator {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.growth-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.growth-value.positive {
  color: #16a34a;
}

.growth-label {
  color: #64748b;
  font-size: 0.875rem;
}

.trends h4 {
  margin: 0 0 1rem;
  color: #1e293b;
  font-size: 1rem;
}

.trends ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trends li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.875rem;
}

.trends li:last-child {
  border-bottom: none;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-style: italic;
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

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .startup-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .risk-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .risk-label,
  .risk-value {
    width: auto;
  }

  .currency-grid, .crypto-grid, .stock-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .trend-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .trend-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style> 