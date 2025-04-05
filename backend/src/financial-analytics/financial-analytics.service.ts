import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  private readonly basePrices = {
    EURUSD: 1.0925,
    GBPUSD: 1.2745,
    USDJPY: 148.25
  };

  private readonly technicalIndicators: { [key: string]: TechnicalIndicator[] } = {
    EURUSD: [
      { name: 'RSI', value: '58.45', signal: 'NEUTRAL' },
      { name: 'MACD', value: '0.0012', signal: 'BUY' },
      { name: 'Moving Average', value: '1.0930', signal: 'SELL' }
    ],
    GBPUSD: [
      { name: 'RSI', value: '62.30', signal: 'BUY' },
      { name: 'MACD', value: '-0.0008', signal: 'SELL' },
      { name: 'Moving Average', value: '1.2740', signal: 'NEUTRAL' }
    ],
    USDJPY: [
      { name: 'RSI', value: '45.80', signal: 'SELL' },
      { name: 'MACD', value: '0.0025', signal: 'BUY' },
      { name: 'Moving Average', value: '148.30', signal: 'NEUTRAL' }
    ]
  };

  private readonly marketSummaries: MarketSummary[] = [
    {
      id: 1,
      title: 'Технический анализ EUR/USD',
      text: 'Евро укрепляется на фоне позитивных экономических данных из еврозоны. RSI указывает на нейтральную динамику.',
      type: 'technical',
      analyst: 'Иван Петров',
      rating: 4.5,
      timestamp: new Date()
    },
    {
      id: 2,
      title: 'Фундаментальный анализ USD',
      text: 'ФРС сохраняет ястребиную позицию по ставкам, что поддерживает доллар США на текущих уровнях.',
      type: 'fundamental',
      analyst: 'Мария Иванова',
      rating: 4.8,
      timestamp: new Date()
    },
    {
      id: 3,
      title: 'Анализ настроений GBP/USD',
      text: 'Настроения трейдеров по фунту остаются смешанными на фоне неопределенности в экономике Великобритании.',
      type: 'sentiment',
      analyst: 'Алексей Смирнов',
      rating: 4.2,
      timestamp: new Date()
    }
  ];

  async getCurrencyPairs(): Promise<CurrencyPair[]> {
    return this.currencyPairs;
  }

  async getChartData(symbol: string, range: string, type: string): Promise<ChartData[]> {
    if (!symbol || !range || !type) {
      throw new BadRequestException('Отсутствуют обязательные параметры');
    }

    if (!this.basePrices[symbol]) {
      throw new NotFoundException(`Валютная пара ${symbol} не найдена`);
    }

    const validRanges = ['1d', '1w', '1m', '3m', '1y'];
    const validTypes = ['line', 'candlestick', 'area'];

    if (!validRanges.includes(range)) {
      throw new BadRequestException(`Недопустимый диапазон. Допустимые значения: ${validRanges.join(', ')}`);
    }

    if (!validTypes.includes(type)) {
      throw new BadRequestException(`Недопустимый тип графика. Допустимые значения: ${validTypes.join(', ')}`);
    }

    const now = Date.now();
    const data: ChartData[] = [];
    
    const points = {
      '1d': 24,
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '1y': 365
    };

    const numPoints = points[range];
    const interval = (range === '1d') ? 3600000 : 86400000;
    const basePrice = this.basePrices[symbol];
    const volatility = 0.002; // 0.2% волатильность

    for (let i = 0; i < numPoints; i++) {
      const timestamp = now - (i * interval);
      if (type === 'candlestick') {
        const open = basePrice + (Math.random() * volatility * 2 - volatility);
        const close = basePrice + (Math.random() * volatility * 2 - volatility);
        const high = Math.max(open, close) + (Math.random() * volatility);
        const low = Math.min(open, close) - (Math.random() * volatility);

        data.push({ timestamp, open, high, low, close });
      } else {
        data.push({
          timestamp,
          value: basePrice + (Math.random() * volatility * 2 - volatility)
        });
      }
    }

    return data.reverse();
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    if (!symbol) {
      throw new BadRequestException('Символ валютной пары не указан');
    }

    const indicators = this.technicalIndicators[symbol];
    if (!indicators) {
      throw new NotFoundException(`Индикаторы для пары ${symbol} не найдены`);
    }

    return indicators;
  }

  async getMarketSummaries(): Promise<MarketSummary[]> {
    return this.marketSummaries;
  }
} 