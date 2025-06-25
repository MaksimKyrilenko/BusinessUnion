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
      <!-- Crypto Market Section -->
      <v-row>
        <v-col cols="12">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Криптовалютный рынок</span>
              <v-spacer></v-spacer>
              <v-btn
                icon
                @click="refreshCryptoData"
                :loading="store.loading"
                :disabled="store.loading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-table>
              <thead>
                <tr>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Изменение 24ч</th>
                    <th>Объем 24ч</th>
                    <th>Рыночная кап.</th>
                </tr>
              </thead>
              <tbody>
                  <tr v-for="coin in store.cryptoData" :key="coin.id">
                    <td>
                      <div class="crypto-name">
                        <img :src="coin.image" :alt="coin.name" class="crypto-image">
                        <span>{{ coin.name }}</span>
                      </div>
                  </td>
                    <td>${{ formatNumber(coin.current_price) }}</td>
                    <td :class="coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'">
                      {{ formatNumber(coin.price_change_percentage_24h) }}%
                  </td>
                    <td>${{ formatNumber(coin.total_volume) }}</td>
                    <td>${{ formatNumber(coin.market_cap) }}</td>
                </tr>
              </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Stock Market Section -->
      <v-row>
        <v-col cols="12">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Фондовый рынок</span>
              <v-spacer></v-spacer>
              <v-btn
                icon
                @click="refreshStockData"
                :loading="store.loading"
                :disabled="store.loading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <h3 class="text-h6 mb-4">Топ растущих</h3>
                  <v-list>
                    <v-list-item v-for="stock in topGainers" :key="stock.ticker">
                      <v-list-item-title>{{ stock.ticker }}</v-list-item-title>
                      <v-list-item-subtitle class="text-success">
                        +{{ stock.change_percentage }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <h3 class="text-h6 mb-4">Топ падающих</h3>
                  <v-list>
                    <v-list-item v-for="stock in topLosers" :key="stock.ticker">
                      <v-list-item-title>{{ stock.ticker }}</v-list-item-title>
                      <v-list-item-subtitle class="text-error">
                        {{ stock.change_percentage }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Market News Section -->
      <v-row>
        <v-col cols="12">
          <v-card class="market-card">
            <v-card-title class="d-flex align-center">
              <span class="text-h5">Новости рынка</span>
              <v-spacer></v-spacer>
              <v-btn
                icon
                @click="refreshNewsData"
                :loading="store.loading"
                :disabled="store.loading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-timeline density="comfortable" align="start">
                <v-timeline-item
                  v-for="news in store.newsData"
                  :key="news.id"
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:opposite>
                    {{ formatDate(news.publishedDate) }}
                  </template>
                  <div class="mb-4">
                    <div class="news-title">{{ news.title }}</div>
                    <div class="news-text">{{ news.text }}</div>
                    <v-btn
                      variant="text"
                      color="primary"
                      :href="news.url"
                      target="_blank"
                    >
                      Читать далее
                    </v-btn>
            </div>
                </v-timeline-item>
              </v-timeline>
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

const topGainers = computed(() => store.stockData?.top_gainers || []);
const topLosers = computed(() => store.stockData?.top_losers || []);

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const refreshCryptoData = () => store.fetchCryptoData();
const refreshStockData = () => store.fetchStockData();
const refreshNewsData = () => store.fetchNewsData();
const retryLoading = () => store.fetchMarketSummary();

onMounted(async () => {
  await store.fetchMarketSummary();
});
</script>

<style scoped>
.v-table {
  background: transparent !important;
}

.market-card {
  margin-bottom: 20px;
}

.crypto-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crypto-image {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.news-title {
  font-weight: 500;
  margin-bottom: 8px;
}

.news-text {
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 16px;
}

.text-success {
  color: #4caf50 !important;
}

.text-error {
  color: #f44336 !important;
}
</style> 