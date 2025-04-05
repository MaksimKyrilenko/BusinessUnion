<template>
  <div class="market-analytics">
    <!-- 1. Обзор рынка -->
    <section class="market-overview">
      <h2>Обзор рынка</h2>
      <div class="overview-grid">
        <!-- Основные индексы -->
        <div class="overview-card">
          <h3>Ключевые индексы</h3>
          <div class="indices-list">
            <div v-for="index in marketIndices" :key="index.name" class="index-item">
              <div class="index-info">
                <span class="index-name">{{ index.name }}</span>
                <span class="index-value">{{ formatNumber(index.value) }}</span>
              </div>
              <div class="index-change" :class="getChangeClass(index.change)">
                {{ formatChange(index.change) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Тренды -->
        <div class="overview-card">
          <h3>Основные тренды</h3>
          <div class="trends-list">
            <div v-for="trend in marketTrends" :key="trend.id" class="trend-item">
              <i :class="trend.icon"></i>
              <div class="trend-content">
                <h4>{{ trend.title }}</h4>
                <p>{{ trend.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Прогнозы -->
        <div class="overview-card">
          <h3>Краткосрочный прогноз</h3>
          <div class="forecast">
            <div v-for="forecast in marketForecasts" :key="forecast.market" class="forecast-item">
              <div class="forecast-header">
                <span>{{ forecast.market }}</span>
                <span :class="getForecastClass(forecast.sentiment)">
                  {{ forecast.sentiment }}
                </span>
              </div>
              <p>{{ forecast.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Графики и статистика -->
    <section class="charts-section">
      <h2>Графики и статистика</h2>
      <div class="charts-grid">
        <!-- График цен -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Динамика цен</h3>
            <div class="chart-controls">
              <select v-model="selectedTimeframe">
                <option v-for="tf in timeframes" :key="tf.value" :value="tf.value">
                  {{ tf.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="price-chart">
            <!-- Здесь будет график -->
            <div class="chart-placeholder">
              График динамики цен
            </div>
          </div>
        </div>

        <!-- Индексы страха и жадности -->
        <div class="chart-card">
          <h3>Индекс страха и жадности</h3>
          <div class="fear-greed-index">
            <div class="gauge-container">
              <div class="gauge" :style="{ '--value': fearGreedIndex + '%' }">
                <div class="gauge-value">{{ fearGreedIndex }}</div>
              </div>
              <div class="gauge-label">{{ getFearGreedLabel(fearGreedIndex) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Аналитика и прогнозы -->
    <section class="analysis-section">
      <h2>Аналитика и прогнозы</h2>
      <div class="analysis-grid">
        <!-- Экспертные мнения -->
        <div class="analysis-card">
          <h3>Экспертные мнения</h3>
          <div class="expert-opinions">
            <div v-for="opinion in expertOpinions" :key="opinion.id" class="opinion-item">
              <div class="expert-info">
                <img :src="opinion.avatar" :alt="opinion.name">
                <div>
                  <h4>{{ opinion.name }}</h4>
                  <span>{{ opinion.position }}</span>
                </div>
              </div>
              <p>{{ opinion.opinion }}</p>
              <div class="opinion-meta">
                <span>{{ opinion.date }}</span>
                <span :class="getChangeClass(opinion.sentiment)">
                  {{ opinion.sentiment }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Исторические сравнения -->
        <div class="analysis-card">
          <h3>Исторические сравнения</h3>
          <div class="historical-comparison">
            <table>
              <thead>
                <tr>
                  <th>Период</th>
                  <th>Изменение</th>
                  <th>Тренд</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="period in historicalData" :key="period.name">
                  <td>{{ period.name }}</td>
                  <td :class="getChangeClass(period.change)">
                    {{ formatChange(period.change) }}
                  </td>
                  <td>
                    <i :class="getTrendIcon(period.trend)"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Инструменты анализа -->
    <section class="tools-section">
      <h2>Инструменты анализа</h2>
      <div class="tools-grid">
        <!-- Калькулятор доходности -->
        <div class="tool-card">
          <h3>Калькулятор доходности</h3>
          <div class="calculator">
            <div class="form-group">
              <label>Сумма инвестиций</label>
              <input type="number" v-model="calculator.amount" @input="calculateReturn">
            </div>
            <div class="form-group">
              <label>Срок (месяцев)</label>
              <input type="number" v-model="calculator.period" @input="calculateReturn">
            </div>
            <div class="form-group">
              <label>Ожидаемая доходность (%)</label>
              <input type="number" v-model="calculator.rate" @input="calculateReturn">
            </div>
            <div class="calculator-result">
              <span>Ожидаемая прибыль:</span>
              <span class="result-value">{{ formatMoney(calculatedReturn) }}</span>
            </div>
          </div>
        </div>

        <!-- Тепловая карта -->
        <div class="tool-card">
          <h3>Тепловая карта активов</h3>
          <div class="heatmap">
            <div v-for="sector in heatmapData" :key="sector.name" 
                 class="heatmap-item"
                 :style="{ backgroundColor: getHeatmapColor(sector.change) }">
              <span class="sector-name">{{ sector.name }}</span>
              <span class="sector-change" :class="getChangeClass(sector.change)">
                {{ formatChange(sector.change) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Рекомендации и стратегии -->
    <section class="recommendations-section">
      <h2>Рекомендации и стратегии</h2>
      <div class="recommendations-grid">
        <!-- Инвестиционные идеи -->
        <div class="recommendation-card">
          <h3>Топ инвестиционные идеи</h3>
          <div class="investment-ideas">
            <div v-for="idea in investmentIdeas" :key="idea.id" class="idea-item">
              <div class="idea-header">
                <h4>{{ idea.title }}</h4>
                <span :class="getChangeClass(idea.potential)">
                  {{ formatChange(idea.potential) }}
                </span>
              </div>
              <p>{{ idea.description }}</p>
              <div class="idea-meta">
                <span>
                  <i class="fas fa-clock"></i>
                  {{ idea.timeframe }}
                </span>
                <span>
                  <i class="fas fa-chart-line"></i>
                  {{ idea.risk }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Технический анализ -->
        <div class="recommendation-card">
          <h3>Технический анализ</h3>
          <div class="technical-analysis">
            <div v-for="analysis in technicalAnalysis" :key="analysis.asset" class="analysis-item">
              <div class="analysis-header">
                <span>{{ analysis.asset }}</span>
                <span :class="getSignalClass(analysis.signal)">
                  {{ analysis.signal }}
                </span>
              </div>
              <div class="indicators">
                <div v-for="indicator in analysis.indicators" :key="indicator.name" class="indicator">
                  <span>{{ indicator.name }}</span>
                  <span :class="getSignalClass(indicator.value)">{{ indicator.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'MarketAnalytics',
  setup() {
    // Данные для обзора рынка
    const marketIndices = ref([
      { name: 'S&P 500', value: 4927.12, change: 1.23 },
      { name: 'NASDAQ', value: 15982.34, change: 1.78 },
      { name: 'BTC/USD', value: 62451.89, change: 2.45 },
      { name: 'ETH/USD', value: 3245.67, change: -0.89 }
    ])

    const marketTrends = ref([
      {
        id: 1,
        icon: 'fas fa-chart-line',
        title: 'Рост технологического сектора',
        description: 'Акции технологических компаний показывают уверенный рост на фоне развития AI'
      },
      {
        id: 2,
        icon: 'fas fa-coins',
        title: 'Криптовалютный рынок',
        description: 'Bitcoin достиг новых максимумов после одобрения ETF'
      },
      {
        id: 3,
        icon: 'fas fa-building',
        title: 'Венчурные инвестиции',
        description: 'Увеличение активности в сфере финансирования стартапов'
      }
    ])

    const marketForecasts = ref([
      {
        market: 'Фондовый рынок',
        sentiment: 'Позитивный',
        description: 'Ожидается продолжение роста на фоне сильной корпоративной отчетности'
      },
      {
        market: 'Криптовалюты',
        sentiment: 'Нейтральный',
        description: 'Возможна консолидация после резкого роста'
      },
      {
        market: 'Венчурный рынок',
        sentiment: 'Позитивный',
        description: 'Увеличение интереса к AI и финтех проектам'
      }
    ])

    // Данные для графиков
    const timeframes = ref([
      { label: '1 день', value: '1d' },
      { label: '1 неделя', value: '1w' },
      { label: '1 месяц', value: '1m' },
      { label: '1 год', value: '1y' }
    ])

    const selectedTimeframe = ref('1d')
    const fearGreedIndex = ref(65)

    // Данные для аналитики
    const expertOpinions = ref([
      {
        id: 1,
        name: 'Алексей Петров',
        position: 'Ведущий аналитик',
        avatar: 'https://picsum.photos/50/50',
        opinion: 'Текущий рост рынка имеет фундаментальные основания',
        date: '24.03.2024',
        sentiment: 'Позитивный'
      },
      {
        id: 2,
        name: 'Мария Иванова',
        position: 'Криптоаналитик',
        avatar: 'https://picsum.photos/51/51',
        opinion: 'Биткоин может достичь новых максимумов в ближайшие месяцы',
        date: '24.03.2024',
        sentiment: 'Позитивный'
      }
    ])

    const historicalData = ref([
      { name: '1 месяц', change: 5.2, trend: 'up' },
      { name: '3 месяца', change: 12.4, trend: 'up' },
      { name: '6 месяцев', change: -3.1, trend: 'down' },
      { name: '1 год', change: 24.7, trend: 'up' }
    ])

    // Данные для калькулятора
    const calculator = ref({
      amount: 100000,
      period: 12,
      rate: 15
    })

    const calculatedReturn = computed(() => {
      const { amount, period, rate } = calculator.value
      return amount * (1 + (rate / 100) * (period / 12)) - amount
    })

    // Данные для тепловой карты
    const heatmapData = ref([
      { name: 'Технологии', change: 2.5 },
      { name: 'Финансы', change: -1.2 },
      { name: 'Здравоохранение', change: 0.8 },
      { name: 'Энергетика', change: -0.5 },
      { name: 'Промышленность', change: 1.7 },
      { name: 'Потребительский сектор', change: 0.3 }
    ])

    // Данные для рекомендаций
    const investmentIdeas = ref([
      {
        id: 1,
        title: 'AI технологии',
        potential: 25.5,
        description: 'Инвестиции в компании, развивающие искусственный интеллект',
        timeframe: '6-12 месяцев',
        risk: 'Умеренный'
      },
      {
        id: 2,
        title: 'Зеленая энергетика',
        potential: 18.3,
        description: 'Компании, специализирующиеся на возобновляемой энергии',
        timeframe: '12-24 месяца',
        risk: 'Низкий'
      }
    ])

    const technicalAnalysis = ref([
      {
        asset: 'BTC/USD',
        signal: 'Покупать',
        indicators: [
          { name: 'RSI', value: 'Нейтрально' },
          { name: 'MACD', value: 'Покупать' },
          { name: 'MA', value: 'Покупать' }
        ]
      },
      {
        asset: 'ETH/USD',
        signal: 'Держать',
        indicators: [
          { name: 'RSI', value: 'Продавать' },
          { name: 'MACD', value: 'Держать' },
          { name: 'MA', value: 'Покупать' }
        ]
      }
    ])

    // Вспомогательные функции
    const formatNumber = (value) => {
      return new Intl.NumberFormat('ru-RU').format(value)
    }

    const formatChange = (value) => {
      return value > 0 ? `+${value}%` : `${value}%`
    }

    const formatMoney = (value) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(value)
    }

    const getChangeClass = (value) => {
      return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
    }

    const getForecastClass = (sentiment) => {
      return {
        'Позитивный': 'positive',
        'Нейтральный': 'neutral',
        'Негативный': 'negative'
      }[sentiment]
    }

    const getSignalClass = (signal) => {
      return {
        'Покупать': 'positive',
        'Держать': 'neutral',
        'Продавать': 'negative'
      }[signal]
    }

    const getTrendIcon = (trend) => {
      return trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
    }

    const getFearGreedLabel = (value) => {
      if (value <= 25) return 'Страх'
      if (value <= 45) return 'Умеренный страх'
      if (value <= 55) return 'Нейтрально'
      if (value <= 75) return 'Умеренная жадность'
      return 'Жадность'
    }

    const getHeatmapColor = (value) => {
      const normalizedValue = (value + 3) / 6 // Нормализация от -3% до +3%
      const hue = normalizedValue * 120 // От красного (0) до зеленого (120)
      return `hsl(${hue}, 70%, 90%)`
    }

    const calculateReturn = () => {
      // Расчет уже происходит в computed свойстве calculatedReturn
    }

    return {
      marketIndices,
      marketTrends,
      marketForecasts,
      timeframes,
      selectedTimeframe,
      fearGreedIndex,
      expertOpinions,
      historicalData,
      calculator,
      calculatedReturn,
      heatmapData,
      investmentIdeas,
      technicalAnalysis,
      formatNumber,
      formatChange,
      formatMoney,
      getChangeClass,
      getForecastClass,
      getSignalClass,
      getTrendIcon,
      getFearGreedLabel,
      getHeatmapColor,
      calculateReturn
    }
  }
})
</script>

<style scoped>
.market-analytics {
  padding: 2rem;
  background: var(--background);
}

section {
  margin-bottom: 2rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.75rem;
}

.overview-grid,
.charts-grid,
.analysis-grid,
.tools-grid,
.recommendations-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.overview-card,
.chart-card,
.analysis-card,
.tool-card,
.recommendation-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

/* Индексы */
.indices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.index-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: var(--radius-md);
}

.index-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.index-name {
  font-weight: 500;
  color: var(--text-primary);
}

.index-value {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Тренды */
.trends-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trend-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radius-md);
}

.trend-item i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.trend-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.trend-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Индикаторы изменений */
.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.neutral {
  color: #6b7280;
}

/* График */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-controls select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
}

.chart-placeholder {
  height: 300px;
  background: #f8fafc;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* Индекс страха и жадности */
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.gauge {
  width: 200px;
  height: 100px;
  background: #f8fafc;
  border-radius: 100px 100px 0 0;
  position: relative;
  overflow: hidden;
  --value: 50%;
}

.gauge::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--value);
  background: linear-gradient(to top, #ef4444, #10b981);
  transition: height 0.3s ease;
}

.gauge-value {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.gauge-label {
  margin-top: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Экспертные мнения */
.expert-opinions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.opinion-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radius-md);
}

.expert-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.expert-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.opinion-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Калькулятор */
.calculator {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.calculator-result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-value {
  font-weight: 500;
  color: var(--primary-color);
}

/* Тепловая карта */
.heatmap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.heatmap-item {
  padding: 1rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Инвестиционные идеи */
.investment-ideas {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.idea-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radius-md);
}

.idea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.idea-header h4 {
  margin: 0;
}

.idea-meta {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.idea-meta i {
  margin-right: 0.5rem;
}

/* Технический анализ */
.technical-analysis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analysis-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radius-md);
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 500;
}

.indicators {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .market-analytics {
    padding: 1rem;
  }

  .overview-grid,
  .charts-grid,
  .analysis-grid,
  .tools-grid,
  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .indicators {
    grid-template-columns: 1fr;
  }
}
</style> 