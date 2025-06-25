import axios from '@/axios';

export const MarketAnalyticsService = {
  async getMarketSummary() {
    const response = await axios.get('/market-analytics/summary');
    return response.data;
  },

  async getCryptoMarketData() {
    const response = await axios.get('/market-analytics/crypto');
    return response.data;
  },

  async getStockMarketData() {
    const response = await axios.get('/market-analytics/stocks');
    return response.data;
  },

  async getMarketNews() {
    const response = await axios.get('/market-analytics/news');
    return response.data;
  },
}; 