import { defineStore } from 'pinia';
import { MarketAnalyticsService } from '@/services/marketAnalytics.service';

export const useMarketAnalyticsStore = defineStore('marketAnalytics', {
  state: () => ({
    cryptoData: [],
    stockData: null,
    newsData: [],
    macroData: {},
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMarketSummary() {
      this.loading = true;
      this.error = null;
      try {
        const data = await MarketAnalyticsService.getMarketSummary();
        this.cryptoData = data.crypto;
        this.stockData = data.stocks;
        this.newsData = data.news;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchMacroData() {
      this.loading = true;
      this.error = null;
      try {
        this.macroData = await MarketAnalyticsService.getEconomicIndicators();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchCryptoData() {
      this.loading = true;
      this.error = null;
      try {
        this.cryptoData = await MarketAnalyticsService.getCryptoMarketData();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchStockData() {
      this.loading = true;
      this.error = null;
      try {
        this.stockData = await MarketAnalyticsService.getStockMarketData();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchNewsData() {
      this.loading = true;
      this.error = null;
      try {
        this.newsData = await MarketAnalyticsService.getMarketNews();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
}); 