import { Injectable } from '@nestjs/common';
import { CurrencyPair, ChartData, TechnicalIndicator, MarketSummary } from './interfaces';

@Injectable()
export class FinancialAnalyticsService {
  private readonly currencyPairs: CurrencyPair[] = [
    {
      symbol: 'EURUSD',
      name: 'EUR/USD',
      price: 1.0925,
      change: 0.15
    },
    {
      symbol: 'GBPUSD',
      name: 'GBP/USD',
      price: 1.2745,
      change: -0.08
    },
    {
      symbol: 'USDJPY',
      name: 'USD/JPY',
      price: 148.25,
      change: 0.22
    }
  ];

  private readonly technicalIndicators: { [key: string]: TechnicalIndicator[] } = {
    EURUSD: [
      { name: 'RSI', value: '58.45', signal: 'NEUTRAL' },
      { name: 'MACD', value: '0.0012', signal: 'BUY' },
      { name: 'Moving Average', value: '1.0930', signal: 'SELL' }
    ]
  };

  private readonly marketSummaries: MarketSummary[] = [
    {
      id: 1,
      title: 'Анализ EUR/USD',
      text: 'Евро укрепляется на фоне позитивных экономических данных из еврозоны',
      type: 'technical',
      analyst: 'Иван Петров',
      rating: 4.5,
      timestamp: new Date()
    }
  ];

  async getCurrencyPairs(): Promise<CurrencyPair[]> {
    return this.currencyPairs;
  }

  async getChartData(symbol: string, range: string, type: string): Promise<ChartData[]> {
    // В реальном приложении здесь будет запрос к API или базе данных
    const now = Date.now();
    const data: ChartData[] = [];
    
    const points = {
      '1d': 24,
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '1y': 365
    };

    const numPoints = points[range] || 24;
    const interval = (range === '1d') ? 3600000 : 86400000;

    for (let i = 0; i < numPoints; i++) {
      const timestamp = now - (i * interval);
      if (type === 'candlestick') {
        data.push({
          timestamp,
          open: 1.0925 + Math.random() * 0.02 - 0.01,
          high: 1.0925 + Math.random() * 0.02,
          low: 1.0925 - Math.random() * 0.02,
          close: 1.0925 + Math.random() * 0.02 - 0.01
        });
      } else {
        data.push({
          timestamp,
          value: 1.0925 + Math.random() * 0.02 - 0.01
        });
      }
    }

    return data.reverse();
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    return this.technicalIndicators[symbol] || [];
  }

  async getMarketSummaries(): Promise<MarketSummary[]> {
    return this.marketSummaries;
  }
} 