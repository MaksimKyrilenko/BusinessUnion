<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Аналитика рынка</h1>
      </v-col>
    </v-row>

    <v-row v-if="store.loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="store.error">
      <v-col cols="12">
        <v-alert type="error" closable>
          {{ store.error }}
          <template v-slot:append>
            <v-btn color="error" variant="text" @click="retryLoading">
              Повторить загрузку
            </v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Макроэкономика и индексы -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Макроэкономика</span>
              <v-spacer />
              <v-chip size="small" color="primary" variant="outlined">
                Обновлено: {{ store.macroData.timestamp ? new Date(store.macroData.timestamp).toLocaleDateString('ru-RU') : '—' }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <div class="macro-grid">
                <div class="macro-section">
                  <h3 class="text-subtitle-1 mb-2">Инфляция (CPI)</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">Мир</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.inflationCpi?.global) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">США</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.inflationCpi?.us) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">ЕС</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.inflationCpi?.eu) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="macro-section">
                  <h3 class="text-subtitle-1 mb-2">Ставка Центробанка</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">FED</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.policyRates?.fed) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">ECB</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.policyRates?.ecb) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">ЦБ РФ</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.policyRates?.russia) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="macro-section">
                  <h3 class="text-subtitle-1 mb-2">Уровень безработицы</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">США</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.unemployment?.us) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">ЕС</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.unemployment?.eu) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Россия</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.macroStats?.unemployment?.russia) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="macro-section">
                  <h3 class="text-subtitle-1 mb-2">Индексы доверия потребителей</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">США</div>
                      <div class="metric-value">
                        {{ formatIndex(store.macroData.macroStats?.consumerConfidence?.us) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">ЕС</div>
                      <div class="metric-value">
                        {{ formatIndex(store.macroData.macroStats?.consumerConfidence?.eu) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Россия</div>
                      <div class="metric-value">
                        {{ formatIndex(store.macroData.macroStats?.consumerConfidence?.russia) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Global & Regional Indices -->
        <v-col cols="12" md="6">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Фондовые индексы</span>
            </v-card-title>
            <v-card-text>
              <div class="indices-block">
                <h3 class="text-subtitle-1 mb-2">S&P 500, Nasdaq, Dow Jones</h3>
                <div class="metrics-row">
                  <div
                    v-if="store.macroData.regionalIndices?.globalBenchmarks?.sp500"
                    class="metric-card"
                  >
                    <div class="metric-label">S&amp;P 500</div>
                    <div class="metric-value">
                      {{ formatNumber(store.macroData.regionalIndices.globalBenchmarks.sp500.price) }}
                    </div>
                    <div
                      class="metric-change"
                      :class="{
                        positive: Number(store.macroData.regionalIndices.globalBenchmarks.sp500.change) > 0,
                        negative: Number(store.macroData.regionalIndices.globalBenchmarks.sp500.change) < 0
                      }"
                    >
                      {{ store.macroData.regionalIndices.globalBenchmarks.sp500.changePercent }}
                    </div>
                  </div>

                  <div
                    v-if="store.macroData.regionalIndices?.globalBenchmarks?.nasdaq"
                    class="metric-card"
                  >
                    <div class="metric-label">Nasdaq</div>
                    <div class="metric-value">
                      {{ formatNumber(store.macroData.regionalIndices.globalBenchmarks.nasdaq.price) }}
                    </div>
                    <div
                      class="metric-change"
                      :class="{
                        positive: Number(store.macroData.regionalIndices.globalBenchmarks.nasdaq.change) > 0,
                        negative: Number(store.macroData.regionalIndices.globalBenchmarks.nasdaq.change) < 0
                      }"
                    >
                      {{ store.macroData.regionalIndices.globalBenchmarks.nasdaq.changePercent }}
                    </div>
                  </div>

                  <div
                    v-if="store.macroData.regionalIndices?.globalBenchmarks?.dow"
                    class="metric-card"
                  >
                    <div class="metric-label">Dow Jones</div>
                    <div class="metric-value">
                      {{ formatNumber(store.macroData.regionalIndices.globalBenchmarks.dow.price) }}
                    </div>
                    <div
                      class="metric-change"
                      :class="{
                        positive: Number(store.macroData.regionalIndices.globalBenchmarks.dow.change) > 0,
                        negative: Number(store.macroData.regionalIndices.globalBenchmarks.dow.change) < 0
                      }"
                    >
                      {{ store.macroData.regionalIndices.globalBenchmarks.dow.changePercent }}
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <h3 class="text-subtitle-1 mb-2">Российские индексы</h3>
                <div class="metrics-row">
                  <div
                    v-for="idx in store.macroData.regionalIndices?.russian || []"
                    :key="idx.name"
                    class="metric-card"
                  >
                    <div class="metric-label">{{ idx.name }}</div>
                    <div class="metric-value">
                      {{ formatNumber(idx.price) }}
                    </div>
                    <div
                      class="metric-change"
                      :class="{
                        positive: String(idx.changePercent).includes('+'),
                        negative: String(idx.changePercent).includes('-')
                      }"
                    >
                      {{ idx.changePercent }}
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <h3 class="text-subtitle-1 mb-2">Европейские индексы</h3>
                <div class="metrics-row">
                  <div
                    v-for="idx in store.macroData.regionalIndices?.european || []"
                    :key="idx.name"
                    class="metric-card"
                  >
                    <div class="metric-label">{{ idx.name }}</div>
                    <div class="metric-value">
                      {{ formatNumber(idx.price) }}
                    </div>
                    <div
                      class="metric-change"
                      :class="{
                        positive: String(idx.changePercent).includes('+'),
                        negative: String(idx.changePercent).includes('-')
                      }"
                    >
                      {{ idx.changePercent }}
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <h3 class="text-subtitle-1 mb-2">Азиатские индексы</h3>
                <div class="metrics-row">
                  <div
                    v-for="idx in store.macroData.regionalIndices?.asian || []"
                    :key="idx.name"
                    class="metric-card"
                  >
                    <div class="metric-label">{{ idx.name }}</div>
                    <div class="metric-value">
                      {{ formatNumber(idx.price) }}
                    </div>
                    <div
                      class="metric-change"
                      :class="{
                        positive: String(idx.changePercent).includes('+'),
                        negative: String(idx.changePercent).includes('-')
                      }"
                    >
                      {{ idx.changePercent }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sectors & Credit / VC Analytics -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Сектора рынка</span>
            </v-card-title>
            <v-card-text>
              <div class="sectors-grid">
                <div
                  v-for="sector in store.macroData.regionalIndices?.sectors || []"
                  :key="sector.name"
                  class="sector-card"
                >
                  <div class="sector-header">
                    <div class="sector-name">{{ sector.name }}</div>
                    <v-chip
                      size="x-small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ sector.weight }}%
                    </v-chip>
                  </div>
                  <div
                    class="sector-return"
                    :class="{
                      positive: String(sector.performance).includes('+'),
                      negative: String(sector.performance).includes('-')
                    }"
                  >
                    Доходность: {{ sector.performance }}
                  </div>
                  <v-progress-linear
                    :model-value="Number(sector.weight)"
                    height="4"
                    color="primary"
                    rounded
                    class="mt-2"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="market-card mt-4">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Кредитные ставки и риски</span>
            </v-card-title>
            <v-card-text>
              <div class="credit-grid">
                <div class="credit-section">
                  <h3 class="text-subtitle-1 mb-2">Ставки</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">Кредиты для бизнеса</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.creditRates?.businessLoans) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Займы инвесторов</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.creditRates?.investorLoans) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Капитал VC-фондов</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.creditRates?.vcFundsCost) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="credit-section">
                  <h3 class="text-subtitle-1 mb-2">Оценка рисков регионов</h3>
                  <div class="risks-grid">
                    <div
                      v-for="risk in store.macroData.creditRates?.regionalRisks || []"
                      :key="risk.region"
                      class="risk-card"
                    >
                      <div class="risk-header">
                        <div class="risk-region">{{ risk.region }}</div>
                        <v-chip size="x-small" variant="outlined">
                          {{ risk.level }}
                        </v-chip>
                      </div>
                      <v-progress-linear
                        :model-value="(risk.score || 0) * 100"
                        height="4"
                        :color="(risk.score || 0) > 0.6 ? 'error' : (risk.score || 0) > 0.4 ? 'warning' : 'success'"
                        rounded
                        class="mt-1"
                      />
                      <div class="risk-score">
                        Риск‑скор: {{ ((risk.score || 0) * 100).toFixed(0) }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Венчурная активность</span>
            </v-card-title>
            <v-card-text>
              <div class="vc-grid">
                <!-- Общая активность -->
                <div class="vc-section">
                  <h3 class="text-subtitle-1 mb-2">Общая активность (VC)</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">Сделок за месяц</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.vcActivity?.dealsLastMonth ?? '—' }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Объем инвестиций</div>
                      <div class="metric-value">
                        ${{ formatNumber(store.macroData.vcAnalytics?.vcActivity?.totalVolumeUsd || 0) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- Рост раундов -->
                <div class="vc-section">
                  <h3 class="text-subtitle-1 mb-2">Рост раундов pre-seed / seed / Series A</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">Pre-seed</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.vcAnalytics?.roundsGrowth?.preSeed) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Seed</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.vcAnalytics?.roundsGrowth?.seed) }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Series A</div>
                      <div class="metric-value">
                        {{ formatPercent(store.macroData.vcAnalytics?.roundsGrowth?.seriesA) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- Количество новых сделок -->
                <div class="vc-section">
                  <h3 class="text-subtitle-1 mb-2">Количество новых сделок</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">Pre-seed</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.dealsByStage?.preSeed ?? '—' }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Seed</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.dealsByStage?.seed ?? '—' }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Series A</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.dealsByStage?.seriesA ?? '—' }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- IPO и pre-IPO -->
                <div class="vc-section">
                  <h3 class="text-subtitle-1 mb-2">IPO и pre-IPO тренды</h3>
                  <div class="metrics-row">
                    <div class="metric-card">
                      <div class="metric-label">Свежие IPO</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.ipoTrends?.recentIpos ?? '—' }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Планируемые pre-IPO</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.ipoTrends?.upcomingPreIpo ?? '—' }}
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-label">Сентимент</div>
                      <div class="metric-value">
                        {{ store.macroData.vcAnalytics?.ipoTrends?.sentiment ?? '—' }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- Прогнозы отраслей -->
                <div class="vc-section">
                  <h3 class="text-subtitle-1 mb-2">Прогнозы отраслей</h3>
                  <div class="industries-grid">
                    <div
                      v-for="fc in store.macroData.vcAnalytics?.industryForecasts || []"
                      :key="fc.sector"
                      class="industry-card"
                    >
                      <div class="industry-name">{{ fc.sector }}</div>
                      <div class="industry-meta">
                        Горизонт: {{ fc.horizon }}
                      </div>
                      <div class="industry-outlook">
                        {{ fc.outlook }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useMarketAnalyticsStore } from '@/stores/marketAnalytics';

const store = useMarketAnalyticsStore();

const formatNumber = (number) => {
  if (!number) return '0';
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(2) + 'B';
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(2) + 'K';
  }
  return number.toFixed(2);
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${Number(value).toFixed(1)}%`;
};

const formatIndex = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return value;
};

const retryLoading = () => store.fetchMacroData();

onMounted(async () => {
  await store.fetchMacroData();
});
</script>

<style scoped>
.market-card {
  margin-bottom: 20px;
}

.macro-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.macro-section {
  padding: 4px 0;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  background: rgba(15, 23, 42, 0.02);
  border-radius: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.metric-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 2px;
}

.metric-value {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.metric-change {
  margin-top: 2px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
}

.metric-change.positive {
  color: #16a34a;
}

.metric-change.negative {
  color: #dc2626;
}

.plain-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plain-list li {
  margin-bottom: 4px;
}

.sectors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.sector-card {
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent),
              #ffffff;
}

.sector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sector-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}

.sector-return {
  font-size: 0.8rem;
  color: #64748b;
}

.sector-return.positive {
  color: #16a34a;
}

.sector-return.negative {
  color: #dc2626;
}

.credit-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.credit-section {
  padding: 4px 0;
}

.risks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.risk-card {
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #ffffff;
}

.risk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.risk-region {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.risk-score {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #64748b;
}

.vc-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vc-section {
  padding: 4px 0;
}

.industries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.industry-card {
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #ffffff;
}

.industry-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.industry-meta {
  font-size: 0.75rem;
  color: #64748b;
}

.industry-outlook {
  margin-top: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #111827;
}
</style> 