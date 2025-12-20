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

  // Бизнес-аналитика методы (новые эндпоинты без авторизации)
  async getStartupStatistics() {
    const response = await axios.get('/business-analytics/startup-stats');
    return response.data;
  },

  async getTopStartups(limit = 5) {
    const response = await axios.get(`/business-analytics/top-startups?limit=${limit}`);
    return response.data;
  },

  async getInvestmentTrends() {
    const response = await axios.get('/business-analytics/investment-trends');
    return response.data;
  },

  async getCategoryDistribution() {
    const response = await axios.get('/business-analytics/category-distribution');
    return response.data;
  },

  async getRiskAnalysis() {
    const response = await axios.get('/business-analytics/risk-analysis');
    return response.data;
  },

  async getMarketForecast() {
    const response = await axios.get('/business-analytics/market-forecast');
    return response.data;
  },

  // Новые методы для расширенной бизнес-аналитики
  async getEconomicIndicators() {
    const response = await axios.get('/business-analytics/economic-indicators');
    return response.data;
  },

  async getIndustryTrends() {
    const response = await axios.get('/business-analytics/industry-trends');
    return response.data;
  },
}; 