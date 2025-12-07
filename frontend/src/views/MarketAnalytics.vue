<template>
  <div class="analytics-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div>
            <h1>Аналитика рынка</h1>
            <p class="header-subtitle">Глобальные рынки и макроэкономика</p>
          </div>
        </div>
        <div class="header-right">
          <div class="period-selector">
            <button class="period-btn active">24ч</button>
            <button class="period-btn">7д</button>
            <button class="period-btn">1м</button>
            <button class="period-btn">1г</button>
          </div>
          <div class="last-update">
            <i class="fas fa-sync-alt"></i>
            <span>{{ store.macroData.timestamp ? new Date(store.macroData.timestamp).toLocaleString('ru-RU') : 'Загрузка...' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="loader"></div>
      <p>Загрузка данных...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ store.error }}</p>
      <button @click="retryLoading" class="retry-btn">Повторить</button>
    </div>

    <template v-else>
      <!-- Macro Overview Section -->
      <section class="section">
        <div class="section-header">
          <h2><i class="fas fa-globe"></i> Макроэкономика</h2>
        </div>
        <div class="macro-grid">
          <div class="macro-card inflation">
            <div class="macro-card-header">
              <span class="macro-icon"><i class="fas fa-percentage"></i></span>
              <span class="macro-title">Инфляция (CPI)</span>
            </div>
            <div class="macro-metrics">
              <div class="macro-metric">
                <span class="region-flag">🌍</span>
                <div class="metric-data">
                  <span class="metric-label">Мир</span>
                  <span class="metric-value">{{ formatPercent(store.macroData.macroStats?.inflationCpi?.global) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇺🇸</span>
                <div class="metric-data">
                  <span class="metric-label">США</span>
                  <span class="metric-value">{{ formatPercent(store.macroData.macroStats?.inflationCpi?.us) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇪🇺</span>
                <div class="metric-data">
                  <span class="metric-label">ЕС</span>
                  <span class="metric-value">{{ formatPercent(store.macroData.macroStats?.inflationCpi?.eu) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="macro-card rates">
            <div class="macro-card-header">
              <span class="macro-icon"><i class="fas fa-landmark"></i></span>
              <span class="macro-title">Ставки ЦБ</span>
            </div>
            <div class="macro-metrics">
              <div class="macro-metric">
                <span class="region-flag">🇺🇸</span>
                <div class="metric-data">
                  <span class="metric-label">FED</span>
                  <span class="metric-value highlight-blue">{{ formatPercent(store.macroData.macroStats?.policyRates?.fed) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇪🇺</span>
                <div class="metric-data">
                  <span class="metric-label">ECB</span>
                  <span class="metric-value highlight-blue">{{ formatPercent(store.macroData.macroStats?.policyRates?.ecb) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇷🇺</span>
                <div class="metric-data">
                  <span class="metric-label">ЦБ РФ</span>
                  <span class="metric-value highlight-red">{{ formatPercent(store.macroData.macroStats?.policyRates?.russia) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="macro-card unemployment">
            <div class="macro-card-header">
              <span class="macro-icon"><i class="fas fa-users"></i></span>
              <span class="macro-title">Безработица</span>
            </div>
            <div class="macro-metrics">
              <div class="macro-metric">
                <span class="region-flag">🇺🇸</span>
                <div class="metric-data">
                  <span class="metric-label">США</span>
                  <span class="metric-value">{{ formatPercent(store.macroData.macroStats?.unemployment?.us) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇪🇺</span>
                <div class="metric-data">
                  <span class="metric-label">ЕС</span>
                  <span class="metric-value">{{ formatPercent(store.macroData.macroStats?.unemployment?.eu) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇷🇺</span>
                <div class="metric-data">
                  <span class="metric-label">Россия</span>
                  <span class="metric-value">{{ formatPercent(store.macroData.macroStats?.unemployment?.russia) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="macro-card confidence">
            <div class="macro-card-header">
              <span class="macro-icon"><i class="fas fa-smile"></i></span>
              <span class="macro-title">Доверие потребителей</span>
            </div>
            <div class="macro-metrics">
              <div class="macro-metric">
                <span class="region-flag">🇺🇸</span>
                <div class="metric-data">
                  <span class="metric-label">США</span>
                  <span class="metric-value">{{ formatIndex(store.macroData.macroStats?.consumerConfidence?.us) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇪🇺</span>
                <div class="metric-data">
                  <span class="metric-label">ЕС</span>
                  <span class="metric-value">{{ formatIndex(store.macroData.macroStats?.consumerConfidence?.eu) }}</span>
                </div>
              </div>
              <div class="macro-metric">
                <span class="region-flag">🇷🇺</span>
                <div class="metric-data">
                  <span class="metric-label">Россия</span>
                  <span class="metric-value">{{ formatIndex(store.macroData.macroStats?.consumerConfidence?.russia) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Global Indices Section -->
      <section class="section">
        <div class="section-header">
          <h2><i class="fas fa-chart-bar"></i> Фондовые индексы</h2>
          <div class="region-tabs">
            <button :class="['tab-btn', { active: activeRegion === 'all' }]" @click="activeRegion = 'all'">Все</button>
            <button :class="['tab-btn', { active: activeRegion === 'us' }]" @click="activeRegion = 'us'">США</button>
            <button :class="['tab-btn', { active: activeRegion === 'ru' }]" @click="activeRegion = 'ru'">Россия</button>
            <button :class="['tab-btn', { active: activeRegion === 'eu' }]" @click="activeRegion = 'eu'">Европа</button>
            <button :class="['tab-btn', { active: activeRegion === 'asia' }]" @click="activeRegion = 'asia'">Азия</button>
          </div>
        </div>
        
        <div class="indices-grid">
          <!-- US Indices -->
          <template v-if="activeRegion === 'all' || activeRegion === 'us'">
            <div v-if="store.macroData.regionalIndices?.globalBenchmarks?.sp500" class="index-card us">
              <div class="index-header">
                <span class="index-region">🇺🇸</span>
                <span class="index-name">S&P 500</span>
              </div>
              <div class="index-value">{{ formatNumber(store.macroData.regionalIndices.globalBenchmarks.sp500.price) }}</div>
              <div class="index-change" :class="getChangeClass(store.macroData.regionalIndices.globalBenchmarks.sp500.change)">
                <i :class="getChangeIcon(store.macroData.regionalIndices.globalBenchmarks.sp500.change)"></i>
                {{ store.macroData.regionalIndices.globalBenchmarks.sp500.changePercent }}
              </div>
              <div class="sparkline"></div>
            </div>
            <div v-if="store.macroData.regionalIndices?.globalBenchmarks?.nasdaq" class="index-card us">
              <div class="index-header">
                <span class="index-region">🇺🇸</span>
                <span class="index-name">NASDAQ</span>
              </div>
              <div class="index-value">{{ formatNumber(store.macroData.regionalIndices.globalBenchmarks.nasdaq.price) }}</div>
              <div class="index-change" :class="getChangeClass(store.macroData.regionalIndices.globalBenchmarks.nasdaq.change)">
                <i :class="getChangeIcon(store.macroData.regionalIndices.globalBenchmarks.nasdaq.change)"></i>
                {{ store.macroData.regionalIndices.globalBenchmarks.nasdaq.changePercent }}
              </div>
            </div>
            <div v-if="store.macroData.regionalIndices?.globalBenchmarks?.dow" class="index-card us">
              <div class="index-header">
                <span class="index-region">🇺🇸</span>
                <span class="index-name">Dow Jones</span>
              </div>
              <div class="index-value">{{ formatNumber(store.macroData.regionalIndices.globalBenchmarks.dow.price) }}</div>
              <div class="index-change" :class="getChangeClass(store.macroData.regionalIndices.globalBenchmarks.dow.change)">
                <i :class="getChangeIcon(store.macroData.regionalIndices.globalBenchmarks.dow.change)"></i>
                {{ store.macroData.regionalIndices.globalBenchmarks.dow.changePercent }}
              </div>
            </div>
          </template>

          <!-- Russian Indices -->
          <template v-if="activeRegion === 'all' || activeRegion === 'ru'">
            <div v-for="idx in store.macroData.regionalIndices?.russian || []" :key="'ru-'+idx.name" class="index-card ru">
              <div class="index-header">
                <span class="index-region">🇷🇺</span>
                <span class="index-name">{{ idx.name }}</span>
              </div>
              <div class="index-value">{{ formatNumber(idx.price) }}</div>
              <div class="index-change" :class="getChangeClassFromString(idx.changePercent)">
                <i :class="getChangeIconFromString(idx.changePercent)"></i>
                {{ idx.changePercent }}
              </div>
            </div>
          </template>

          <!-- European Indices -->
          <template v-if="activeRegion === 'all' || activeRegion === 'eu'">
            <div v-for="idx in store.macroData.regionalIndices?.european || []" :key="'eu-'+idx.name" class="index-card eu">
              <div class="index-header">
                <span class="index-region">🇪🇺</span>
                <span class="index-name">{{ idx.name }}</span>
              </div>
              <div class="index-value">{{ formatNumber(idx.price) }}</div>
              <div class="index-change" :class="getChangeClassFromString(idx.changePercent)">
                <i :class="getChangeIconFromString(idx.changePercent)"></i>
                {{ idx.changePercent }}
              </div>
            </div>
          </template>

          <!-- Asian Indices -->
          <template v-if="activeRegion === 'all' || activeRegion === 'asia'">
            <div v-for="idx in store.macroData.regionalIndices?.asian || []" :key="'asia-'+idx.name" class="index-card asia">
              <div class="index-header">
                <span class="index-region">🌏</span>
                <span class="index-name">{{ idx.name }}</span>
              </div>
              <div class="index-value">{{ formatNumber(idx.price) }}</div>
              <div class="index-change" :class="getChangeClassFromString(idx.changePercent)">
                <i :class="getChangeIconFromString(idx.changePercent)"></i>
                {{ idx.changePercent }}
              </div>
            </div>
          </template>
        </div>
      </section>


      <!-- Sectors & Credit Section -->
      <section class="section">
        <div class="two-column-grid">
          <!-- Sectors -->
          <div class="panel">
            <div class="panel-header">
              <h3><i class="fas fa-industry"></i> Сектора рынка</h3>
            </div>
            <div class="sectors-list">
              <div v-for="(sector, index) in store.macroData.regionalIndices?.sectors || []" :key="sector.name" class="sector-item" :style="{ '--delay': index * 0.05 + 's' }">
                <div class="sector-info">
                  <span class="sector-name">{{ sector.name }}</span>
                  <span class="sector-weight">{{ sector.weight }}%</span>
                </div>
                <div class="sector-bar">
                  <div class="sector-progress" :style="{ width: sector.weight + '%' }"></div>
                </div>
                <div class="sector-performance" :class="getChangeClassFromString(sector.performance)">
                  {{ sector.performance }}
                </div>
              </div>
            </div>
          </div>

          <!-- Credit & Risks -->
          <div class="panel">
            <div class="panel-header">
              <h3><i class="fas fa-shield-alt"></i> Кредитные ставки и риски</h3>
            </div>
            <div class="credit-grid">
              <div class="credit-card">
                <div class="credit-icon"><i class="fas fa-building"></i></div>
                <div class="credit-info">
                  <span class="credit-label">Бизнес кредиты</span>
                  <span class="credit-value">{{ formatPercent(store.macroData.creditRates?.businessLoans) }}</span>
                </div>
              </div>
              <div class="credit-card">
                <div class="credit-icon"><i class="fas fa-user-tie"></i></div>
                <div class="credit-info">
                  <span class="credit-label">Займы инвесторов</span>
                  <span class="credit-value">{{ formatPercent(store.macroData.creditRates?.investorLoans) }}</span>
                </div>
              </div>
              <div class="credit-card">
                <div class="credit-icon"><i class="fas fa-rocket"></i></div>
                <div class="credit-info">
                  <span class="credit-label">VC-фонды</span>
                  <span class="credit-value">{{ formatPercent(store.macroData.creditRates?.vcFundsCost) }}</span>
                </div>
              </div>
            </div>
            
            <div class="risks-section">
              <h4>Риски регионов</h4>
              <div class="risks-heatmap">
                <div v-for="risk in store.macroData.creditRates?.regionalRisks || []" :key="risk.region" class="risk-item" :class="getRiskClass(risk.score)">
                  <span class="risk-region">{{ risk.region }}</span>
                  <span class="risk-level">{{ risk.level }}</span>
                  <div class="risk-bar">
                    <div class="risk-fill" :style="{ width: (risk.score || 0) * 100 + '%' }"></div>
                  </div>
                  <span class="risk-score">{{ ((risk.score || 0) * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- VC Analytics Section -->
      <section class="section">
        <div class="section-header">
          <h2><i class="fas fa-rocket"></i> Венчурная активность</h2>
        </div>
        <div class="vc-grid">
          <div class="vc-card highlight">
            <div class="vc-card-header">
              <i class="fas fa-handshake"></i>
              <span>Общая активность</span>
            </div>
            <div class="vc-stats">
              <div class="vc-stat">
                <span class="vc-stat-value">{{ store.macroData.vcAnalytics?.vcActivity?.dealsLastMonth ?? '—' }}</span>
                <span class="vc-stat-label">Сделок за месяц</span>
              </div>
              <div class="vc-stat">
                <span class="vc-stat-value">${{ formatNumber(store.macroData.vcAnalytics?.vcActivity?.totalVolumeUsd || 0) }}</span>
                <span class="vc-stat-label">Объем инвестиций</span>
              </div>
            </div>
          </div>

          <div class="vc-card">
            <div class="vc-card-header">
              <i class="fas fa-chart-line"></i>
              <span>Рост раундов</span>
            </div>
            <div class="rounds-grid">
              <div class="round-item">
                <span class="round-stage">Pre-seed</span>
                <span class="round-value" :class="getGrowthClass(store.macroData.vcAnalytics?.roundsGrowth?.preSeed)">{{ formatPercent(store.macroData.vcAnalytics?.roundsGrowth?.preSeed) }}</span>
              </div>
              <div class="round-item">
                <span class="round-stage">Seed</span>
                <span class="round-value" :class="getGrowthClass(store.macroData.vcAnalytics?.roundsGrowth?.seed)">{{ formatPercent(store.macroData.vcAnalytics?.roundsGrowth?.seed) }}</span>
              </div>
              <div class="round-item">
                <span class="round-stage">Series A</span>
                <span class="round-value" :class="getGrowthClass(store.macroData.vcAnalytics?.roundsGrowth?.seriesA)">{{ formatPercent(store.macroData.vcAnalytics?.roundsGrowth?.seriesA) }}</span>
              </div>
            </div>
          </div>

          <div class="vc-card">
            <div class="vc-card-header">
              <i class="fas fa-file-signature"></i>
              <span>Новые сделки</span>
            </div>
            <div class="deals-grid">
              <div class="deal-item"><span class="deal-stage">Pre-seed</span><span class="deal-count">{{ store.macroData.vcAnalytics?.dealsByStage?.preSeed ?? '—' }}</span></div>
              <div class="deal-item"><span class="deal-stage">Seed</span><span class="deal-count">{{ store.macroData.vcAnalytics?.dealsByStage?.seed ?? '—' }}</span></div>
              <div class="deal-item"><span class="deal-stage">Series A</span><span class="deal-count">{{ store.macroData.vcAnalytics?.dealsByStage?.seriesA ?? '—' }}</span></div>
            </div>
          </div>

          <div class="vc-card ipo">
            <div class="vc-card-header">
              <i class="fas fa-bell"></i>
              <span>IPO тренды</span>
            </div>
            <div class="ipo-feed">
              <div class="ipo-item">
                <div class="ipo-icon green"><i class="fas fa-arrow-up"></i></div>
                <div class="ipo-info">
                  <span class="ipo-label">Свежие IPO</span>
                  <span class="ipo-value">{{ store.macroData.vcAnalytics?.ipoTrends?.recentIpos ?? '—' }}</span>
                </div>
              </div>
              <div class="ipo-item">
                <div class="ipo-icon blue"><i class="fas fa-clock"></i></div>
                <div class="ipo-info">
                  <span class="ipo-label">Планируемые pre-IPO</span>
                  <span class="ipo-value">{{ store.macroData.vcAnalytics?.ipoTrends?.upcomingPreIpo ?? '—' }}</span>
                </div>
              </div>
              <div class="ipo-item">
                <div class="ipo-icon" :class="getSentimentClass(store.macroData.vcAnalytics?.ipoTrends?.sentiment)"><i class="fas fa-heart"></i></div>
                <div class="ipo-info">
                  <span class="ipo-label">Сентимент</span>
                  <span class="ipo-value">{{ store.macroData.vcAnalytics?.ipoTrends?.sentiment ?? '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Industry Forecasts -->
      <section v-if="store.macroData.vcAnalytics?.industryForecasts?.length" class="section">
        <div class="section-header">
          <h2><i class="fas fa-crystal-ball"></i> Прогнозы отраслей</h2>
        </div>
        <div class="forecasts-grid">
          <div v-for="fc in store.macroData.vcAnalytics?.industryForecasts || []" :key="fc.sector" class="forecast-card">
            <div class="forecast-sector">{{ fc.sector }}</div>
            <div class="forecast-horizon"><i class="fas fa-calendar"></i> {{ fc.horizon }}</div>
            <div class="forecast-outlook" :class="getOutlookClass(fc.outlook)">{{ fc.outlook }}</div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMarketAnalyticsStore } from '@/stores/marketAnalytics';

const store = useMarketAnalyticsStore();
const activeRegion = ref('all');

const formatNumber = (number) => {
  if (!number) return '0';
  if (number >= 1000000000) return (number / 1000000000).toFixed(2) + 'B';
  if (number >= 1000000) return (number / 1000000).toFixed(2) + 'M';
  if (number >= 1000) return (number / 1000).toFixed(2) + 'K';
  return number.toFixed(2);
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${Number(value).toFixed(1)}%`;
};

const formatIndex = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return value;
};

const getChangeClass = (change) => Number(change) > 0 ? 'positive' : Number(change) < 0 ? 'negative' : '';
const getChangeIcon = (change) => Number(change) > 0 ? 'fas fa-caret-up' : Number(change) < 0 ? 'fas fa-caret-down' : 'fas fa-minus';
const getChangeClassFromString = (str) => String(str).includes('+') ? 'positive' : String(str).includes('-') ? 'negative' : '';
const getChangeIconFromString = (str) => String(str).includes('+') ? 'fas fa-caret-up' : String(str).includes('-') ? 'fas fa-caret-down' : 'fas fa-minus';
const getRiskClass = (score) => (score || 0) > 0.6 ? 'high' : (score || 0) > 0.4 ? 'medium' : 'low';
const getGrowthClass = (value) => value > 0 ? 'positive' : value < 0 ? 'negative' : '';
const getSentimentClass = (sentiment) => sentiment === 'Positive' || sentiment === 'Bullish' ? 'green' : sentiment === 'Negative' || sentiment === 'Bearish' ? 'red' : 'neutral';
const getOutlookClass = (outlook) => outlook?.toLowerCase().includes('рост') || outlook?.toLowerCase().includes('positive') ? 'positive' : outlook?.toLowerCase().includes('спад') || outlook?.toLowerCase().includes('negative') ? 'negative' : 'neutral';

const retryLoading = () => store.fetchMacroData();

onMounted(async () => {
  await store.fetchMacroData();
});
</script>


<style scoped>
/* Base */
.analytics-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1.5rem;
  color: #1e293b;
}

/* Header */
.page-header {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
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
  gap: 1.5rem;
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

.period-btn:hover { color: #1e293b; background: #e2e8f0; }
.period-btn.active {
  background: #2563eb;
  color: white;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

.last-update i { animation: spin 2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Loading & Error */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state i { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

/* Sections */
.section {
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.section-header h2 i {
  color: #2563eb;
}

/* Region Tabs */
.region-tabs {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.tab-btn:hover { color: #1e293b; background: #e2e8f0; }
.tab-btn.active { background: #2563eb; color: white; }

/* Macro Grid */
.macro-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.macro-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.macro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.1);
  border-color: #2563eb;
}

.macro-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.macro-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.inflation .macro-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
.rates .macro-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
.unemployment .macro-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
.confidence .macro-icon { background: linear-gradient(135deg, #10b981, #059669); color: white; }

.macro-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.macro-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.macro-metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.macro-metric:last-child { border-bottom: none; }

.region-flag { font-size: 1.25rem; }

.metric-data {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.metric-label { color: #64748b; font-size: 0.85rem; }
.metric-value { font-weight: 700; font-size: 1.1rem; color: #1e293b; }
.metric-value.highlight-blue { color: #2563eb; }
.metric-value.highlight-red { color: #dc2626; }

/* Index Cards */
.indices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.index-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.index-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.index-card.us::before { background: #2563eb; }
.index-card.ru::before { background: #dc2626; }
.index-card.eu::before { background: #7c3aed; }
.index-card.asia::before { background: #059669; }

.index-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.1);
}

.index-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.index-region { font-size: 1.25rem; }
.index-name { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
.index-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }

.index-change {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.index-change.positive { background: #dcfce7; color: #16a34a; }
.index-change.negative { background: #fee2e2; color: #dc2626; }

/* Two Column Grid */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.panel-header {
  margin-bottom: 1.25rem;
}

.panel-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.panel-header h3 i { color: #2563eb; }

/* Sectors */
.sectors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sector-item {
  display: grid;
  grid-template-columns: 1fr 120px 80px;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  animation: slideIn 0.3s ease-out backwards;
  animation-delay: var(--delay);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.sector-info {
  display: flex;
  justify-content: space-between;
}

.sector-name { font-weight: 500; color: #1e293b; }
.sector-weight { color: #64748b; font-size: 0.85rem; }

.sector-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.sector-progress {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.sector-performance {
  text-align: right;
  font-weight: 600;
  font-size: 0.9rem;
}

.sector-performance.positive { color: #16a34a; }
.sector-performance.negative { color: #dc2626; }

/* Credit */
.credit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.credit-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.credit-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.credit-label { font-size: 0.8rem; color: #64748b; }
.credit-value { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

/* Risks */
.risks-section h4 {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 1rem;
  font-weight: 500;
}

.risks-heatmap {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.risk-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.875rem;
  border-left: 3px solid;
}

.risk-item.low { border-left-color: #16a34a; }
.risk-item.medium { border-left-color: #d97706; }
.risk-item.high { border-left-color: #dc2626; }

.risk-region { font-weight: 600; color: #1e293b; display: block; margin-bottom: 0.25rem; }
.risk-level { font-size: 0.8rem; color: #64748b; }

.risk-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 0.5rem 0;
  overflow: hidden;
}

.risk-fill { height: 100%; border-radius: 2px; }
.risk-item.low .risk-fill { background: #16a34a; }
.risk-item.medium .risk-fill { background: #d97706; }
.risk-item.high .risk-fill { background: #dc2626; }

.risk-score { font-size: 0.85rem; font-weight: 600; color: #64748b; }

/* VC Grid */
.vc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.vc-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.vc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.1);
}

.vc-card.highlight {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border-color: #2563eb;
}

.vc-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.vc-card-header i { color: #2563eb; }

.vc-stats { display: flex; flex-direction: column; gap: 1rem; }
.vc-stat-value { font-size: 1.75rem; font-weight: 700; color: #1e293b; display: block; }
.vc-stat-label { font-size: 0.8rem; color: #64748b; }

.rounds-grid, .deals-grid { display: flex; flex-direction: column; gap: 0.75rem; }

.round-item, .deal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.round-item:last-child, .deal-item:last-child { border-bottom: none; }

.round-stage, .deal-stage { color: #64748b; font-size: 0.9rem; }
.round-value { font-weight: 700; font-size: 1.1rem; }
.round-value.positive { color: #16a34a; }
.round-value.negative { color: #dc2626; }
.deal-count { font-weight: 700; font-size: 1.25rem; color: #1e293b; }

/* IPO Feed */
.ipo-feed { display: flex; flex-direction: column; gap: 0.75rem; }

.ipo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.ipo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.ipo-icon.green { background: #dcfce7; color: #16a34a; }
.ipo-icon.blue { background: #dbeafe; color: #2563eb; }
.ipo-icon.red { background: #fee2e2; color: #dc2626; }
.ipo-icon.neutral { background: #f1f5f9; color: #64748b; }

.ipo-label { font-size: 0.8rem; color: #64748b; display: block; }
.ipo-value { font-weight: 600; color: #1e293b; }

/* Forecasts */
.forecasts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.forecast-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.forecast-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.1);
}

.forecast-sector { font-weight: 600; color: #1e293b; font-size: 1rem; margin-bottom: 0.5rem; }
.forecast-horizon { font-size: 0.8rem; color: #64748b; margin-bottom: 0.75rem; }
.forecast-horizon i { margin-right: 0.35rem; }

.forecast-outlook {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
}

.forecast-outlook.positive { background: #dcfce7; color: #16a34a; }
.forecast-outlook.negative { background: #fee2e2; color: #dc2626; }
.forecast-outlook.neutral { background: #f1f5f9; color: #64748b; }

/* Responsive */
@media (max-width: 1200px) {
  .macro-grid { grid-template-columns: repeat(2, 1fr); }
  .vc-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .two-column-grid { grid-template-columns: 1fr; }
  .credit-grid { grid-template-columns: 1fr; }
  .risks-heatmap { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .analytics-page { padding: 1rem; }
  .page-header { padding: 1rem; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .macro-grid { grid-template-columns: 1fr; }
  .vc-grid { grid-template-columns: 1fr; }
  .indices-grid { grid-template-columns: 1fr; }
  .sector-item { grid-template-columns: 1fr; gap: 0.5rem; }
}
</style>