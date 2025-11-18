import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MarketAnalyticsService implements OnModuleInit {
  private readonly alphaVantageApiKey: string;
  private readonly exchangeRatesApiKey: string;

  constructor(private configService: ConfigService) {
    this.alphaVantageApiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY') || '';
    this.exchangeRatesApiKey = this.configService.get<string>('EXCHANGE_RATES_API_KEY') || '';
  }

  async onModuleInit() {
    // Не выбрасываем ошибку, если API ключи отсутствуют - будем использовать моковые данные
    console.log('MarketAnalyticsService initialized');
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
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('CoinGecko API Error:', error.response?.data || error.message);
      // Возвращаем моковые данные в случае ошибки
      return this.getMockCryptoData();
    }
  }

  private getMockCryptoData() {
    return [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        current_price: 45000,
        price_change_percentage_24h: 2.5,
        total_volume: 25000000000,
        market_cap: 850000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'eth',
        current_price: 3200,
        price_change_percentage_24h: -1.2,
        total_volume: 15000000000,
        market_cap: 380000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
    ];
  }

  async getStockMarketData() {
    if (!this.alphaVantageApiKey) {
      return this.getMockStockData();
    }

    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'TOP_GAINERS_LOSERS',
            apikey: this.alphaVantageApiKey,
          },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Alpha Vantage API Error:', error.response?.data || error.message);
      return this.getMockStockData();
    }
  }

  private getMockStockData() {
    return {
      top_gainers: [
        { ticker: 'AAPL', change_percentage: '5.2%' },
        { ticker: 'MSFT', change_percentage: '3.8%' },
        { ticker: 'GOOGL', change_percentage: '2.9%' }
      ],
      top_losers: [
        { ticker: 'TSLA', change_percentage: '-4.1%' },
        { ticker: 'AMZN', change_percentage: '-2.7%' },
        { ticker: 'META', change_percentage: '-1.9%' }
      ]
    };
  }

  async getMarketNews() {
    if (!this.alphaVantageApiKey) {
      return this.getMockNewsData();
    }

    try {
      const response = await axios.get(
        'https://www.alphavantage.co/query',
        {
          params: {
            function: 'NEWS_SENTIMENT',
            apikey: this.alphaVantageApiKey,
            topics: 'technology,finance',
            sort: 'LATEST'
          },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Alpha Vantage News API Error:', error.response?.data || error.message);
      return this.getMockNewsData();
    }
  }

  private getMockNewsData() {
    return {
      feed: [
        {
          id: 1,
          title: 'Технологические акции показывают рост на фоне новых инноваций',
          text: 'Рынок технологических акций демонстрирует положительную динамику благодаря новым разработкам в области искусственного интеллекта.',
          publishedDate: new Date().toISOString(),
          url: '#'
        },
        {
          id: 2,
          title: 'Криптовалютный рынок стабилизируется после волатильности',
          text: 'Основные криптовалюты показывают признаки стабилизации после периода высокой волатильности.',
          publishedDate: new Date(Date.now() - 3600000).toISOString(),
          url: '#'
        }
      ]
    };
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