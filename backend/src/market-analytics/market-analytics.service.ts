import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MarketAnalyticsService implements OnModuleInit {
  private readonly alphaVantageApiKey: string;

  constructor(private configService: ConfigService) {
    const alphaVantageApiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');

    if (!alphaVantageApiKey) {
      throw new Error('Missing required API key in environment variables');
    }

    this.alphaVantageApiKey = alphaVantageApiKey;
  }

  async onModuleInit() {
    if (!this.alphaVantageApiKey) {
      throw new Error('Missing required API key');
    }
  }

  async getCryptoMarketData() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
            locale: 'en'
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('CoinGecko API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch crypto market data: ${error.message}`);
    }
  }

  async getStockMarketData() {
    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'TOP_GAINERS_LOSERS',
            apikey: this.alphaVantageApiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Alpha Vantage API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch stock market data: ${error.message}`);
    }
  }

  async getMarketNews() {
    try {
      // Получаем дополнительную информацию о компаниях через Alpha Vantage
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'NEWS_SENTIMENT',
            apikey: this.alphaVantageApiKey,
            topics: 'technology,finance',
            sort: 'LATEST'
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Alpha Vantage News API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch market news: ${error.message}`);
    }
  }

  async getMarketSummary() {
    try {
      const [cryptoData, stockData, newsData] = await Promise.all([
        this.getCryptoMarketData(),
        this.getStockMarketData(),
        this.getMarketNews(),
      ]);

      return {
        crypto: cryptoData,
        stocks: stockData,
        news: newsData,
      };
    } catch (error) {
      console.error('Market Summary Error:', error);
      throw new Error(`Failed to fetch market summary: ${error.message}`);
    }
  }
} 