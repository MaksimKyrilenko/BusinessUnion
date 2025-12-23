import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Investment } from '../investments/investment.entity';
import { User } from '../users/user.entity';
import axios from 'axios';

@Injectable()
export class BusinessAnalyticsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStartupStatistics() {
    try {
      console.log('Fetching startup statistics from database...');
      
      const totalStartups = await this.projectRepository.count();
      console.log('Total startups:', totalStartups);
      
      const activeStartups = await this.projectRepository.count({
        where: { status: 'active' }
      });
      console.log('Active startups:', activeStartups);
      
      // Если нет инвестиций, считаем общий объем нужных инвестиций из проектов
      const totalInvestments = await this.investmentRepository
        .createQueryBuilder('investment')
        .select('SUM(investment.amount)', 'total')
        .getRawOne();
      console.log('Total investments raw:', totalInvestments);
      
      // Если инвестиций нет, считаем общий объем нужных инвестиций
      let totalInvestmentAmount = parseFloat(totalInvestments?.total) || 0;
      if (totalInvestmentAmount === 0) {
        const totalNeededInvestments = await this.projectRepository
          .createQueryBuilder('project')
          .select('SUM(project.investmentNeeded)', 'total')
          .getRawOne();
        totalInvestmentAmount = parseFloat(totalNeededInvestments?.total) || 0;
        console.log('Using investmentNeeded from projects:', totalInvestmentAmount);
      }

      const averageRoi = await this.projectRepository
        .createQueryBuilder('project')
        .select('AVG(project.expectedRoi)', 'average')
        .getRawOne();
      console.log('Average ROI raw:', averageRoi);

      const result = {
        totalStartups,
        activeStartups,
        totalInvestments: totalInvestmentAmount,
        averageRoi: parseFloat(averageRoi?.average) || 0
      };
      
      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching startup statistics:', error);
      console.log('Returning mock data due to error');
      return this.getMockStartupStats();
    }
  }

  async getTopStartups(limit: number = 5) {
    try {
      console.log('Fetching top startups from database...');
      
      const topStartups = await this.projectRepository.find({
        relations: ['author'],
        order: { expectedRoi: 'DESC' },
        take: limit
      });

      console.log('Found startups:', topStartups.length);

      const result = topStartups.map(startup => ({
        id: startup.id,
        title: startup.title,
        category: startup.category || { name: 'Не указано' },
        expectedRoi: typeof startup.expectedRoi === 'string' ? parseFloat(startup.expectedRoi) : startup.expectedRoi,
        investmentNeeded: typeof startup.investmentNeeded === 'string' ? parseFloat(startup.investmentNeeded) : startup.investmentNeeded,
        author: {
          firstName: startup.author?.firstName || 'Неизвестно',
          lastName: startup.author?.lastName || ''
        }
      }));
      
      console.log('Top startups result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching top startups:', error);
      console.log('Returning mock data due to error');
      return this.getMockTopStartups();
    }
  }

  async getInvestmentTrends() {
    try {
      console.log('Fetching investment trends from database...');
      
      // Получаем данные за последние 6 месяцев
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const trends = await this.investmentRepository
        .createQueryBuilder('investment')
        .select('DATE_FORMAT(investment.createdAt, "%Y-%m")', 'month')
        .addSelect('SUM(investment.amount)', 'total')
        .addSelect('COUNT(investment.id)', 'count')
        .where('investment.createdAt >= :date', { date: sixMonthsAgo })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      console.log('Investment trends raw:', trends);

      // Если нет инвестиций, создаем тренды на основе проектов
      if (trends.length === 0) {
        const projectTrends = await this.projectRepository
          .createQueryBuilder('project')
          .select('DATE_FORMAT(project.createdAt, "%Y-%m")', 'month')
          .addSelect('SUM(project.investmentNeeded)', 'total')
          .addSelect('COUNT(project.id)', 'count')
          .where('project.createdAt >= :date', { date: sixMonthsAgo })
          .groupBy('month')
          .orderBy('month', 'ASC')
          .getRawMany();

        console.log('Project trends (fallback):', projectTrends);
        
        const result = projectTrends.map(trend => ({
          month: trend.month,
          total: parseFloat(trend.total) || 0,
          count: parseInt(trend.count) || 0
        }));
        
        console.log('Final trends result:', result);
        return result;
      }

      const result = trends.map(trend => ({
        month: trend.month,
        total: parseFloat(trend.total) || 0,
        count: parseInt(trend.count) || 0
      }));
      
      console.log('Final trends result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching investment trends:', error);
      console.log('Returning mock data due to error');
      return this.getMockInvestmentTrends();
    }
  }

  async getCategoryDistribution() {
    try {
      const categories = await this.projectRepository
        .createQueryBuilder('project')
        .select('project.category', 'category')
        .addSelect('COUNT(project.id)', 'count')
        .groupBy('project.category')
        .getRawMany();

      return categories.map(cat => ({
        name: cat.category?.name || 'Не указано',
        count: parseInt(cat.count) || 0
      }));
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      return this.getMockCategoryDistribution();
    }
  }

  async getRiskAnalysis() {
    try {
      console.log('Fetching risk analysis from database...');
      
      const highRisk = await this.projectRepository
        .createQueryBuilder('project')
        .where('project.expectedRoi > :threshold', { threshold: 50 })
        .getCount();
      
      const mediumRisk = await this.projectRepository
        .createQueryBuilder('project')
        .where('project.expectedRoi > :min AND project.expectedRoi <= :max', {
          min: 20,
          max: 50
        })
        .getCount();

      const lowRisk = await this.projectRepository
        .createQueryBuilder('project')
        .where('project.expectedRoi <= :threshold', { threshold: 20 })
        .getCount();

      const result = {
        highRisk,
        mediumRisk,
        lowRisk
      };
      
      console.log('Risk analysis result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
      console.log('Returning mock data due to error');
      return this.getMockRiskAnalysis();
    }
  }

  async getMarketForecast() {
    try {
      // Простой прогноз на основе исторических данных
      const recentInvestments = await this.investmentRepository
        .createQueryBuilder('investment')
        .select('AVG(investment.amount)', 'average')
        .where('investment.createdAt >= :date', { 
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        })
        .getRawOne();

      const previousMonthInvestments = await this.investmentRepository
        .createQueryBuilder('investment')
        .select('AVG(investment.amount)', 'average')
        .where('investment.createdAt BETWEEN :start AND :end', {
          start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        })
        .getRawOne();

      const currentAvg = parseFloat(recentInvestments.average) || 0;
      const previousAvg = parseFloat(previousMonthInvestments.average) || 0;
      
      const growth = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 15;

      return {
        marketGrowth: Math.round(growth * 10) / 10,
        trends: [
          'Рост инвестиций в AI и ML',
          'Развитие экологических проектов',
          'Увеличение интереса к Web3',
          'Фокус на кибербезопасности'
        ]
      };
    } catch (error) {
      console.error('Error fetching market forecast:', error);
      return this.getMockMarketForecast();
    }
  }

  // Моковые данные для fallback
  private getMockStartupStats() {
    return {
      totalStartups: 150,
      activeStartups: 89,
      totalInvestments: 25000000,
      averageRoi: 25.5
    };
  }

  private getMockTopStartups() {
    return [
      {
        id: 1,
        title: 'AI Platform',
        category: { name: 'Технологии' },
        expectedRoi: 45,
        investmentNeeded: 500000,
        author: { firstName: 'Иван', lastName: 'Петров' }
      },
      {
        id: 2,
        title: 'EcoTech Solutions',
        category: { name: 'Экология' },
        expectedRoi: 38,
        investmentNeeded: 750000,
        author: { firstName: 'Анна', lastName: 'Сидорова' }
      }
    ];
  }

  private getMockInvestmentTrends() {
    return [
      { month: '2024-01', total: 1000000, count: 5 },
      { month: '2024-02', total: 1500000, count: 8 },
      { month: '2024-03', total: 2000000, count: 12 },
      { month: '2024-04', total: 1800000, count: 10 },
      { month: '2024-05', total: 2500000, count: 15 },
      { month: '2024-06', total: 3000000, count: 18 }
    ];
  }

  private getMockCategoryDistribution() {
    return [
      { name: 'Технологии', count: 45 },
      { name: 'Финансы', count: 30 },
      { name: 'Здравоохранение', count: 25 },
      { name: 'Образование', count: 20 },
      { name: 'Другое', count: 30 }
    ];
  }

  private getMockRiskAnalysis() {
    return {
      highRisk: 25,
      mediumRisk: 60,
      lowRisk: 65
    };
  }

  private getMockMarketForecast() {
    return {
      marketGrowth: 15,
      trends: [
        'Рост инвестиций в AI и ML',
        'Развитие экологических проектов',
        'Увеличение интереса к Web3',
        'Фокус на кибербезопасности'
      ]
    };
  }

  private getMockStockIndices() {
    return {
      sp500: {
        price: 4500.0,
        change: 12.5,
        changePercent: '+0.28%'
      },
      nasdaq: {
        price: 14200.0,
        change: 45.2,
        changePercent: '+0.32%'
      },
      dow: {
        price: 34500.0,
        change: 98.3,
        changePercent: '+0.29%'
      }
    };
  }

  // Новые методы для бизнес-аналитики
  
  async getEconomicIndicators() {
    try {
      console.log('Fetching economic indicators...');
      
      // Получаем курсы валют
      const exchangeRates = await this.getExchangeRates();
      
      // Получаем данные о криптовалютах
      const cryptoData = await this.getCryptoData();
      
      // Получаем данные о фондовых индексах
      const stockIndices = await this.getStockIndices();

      // Базовые макро‑ и венчурные показатели
      const macroStats = await this.getMacroStats();
      const regionalIndices = await this.getRegionalIndices(stockIndices);
      const creditRates = await this.getCreditRates();
      const vcAnalytics = await this.getVcAnalytics();
      
      return {
        exchangeRates: exchangeRates ?? null,
        cryptoData: cryptoData ?? null,
        stockIndices: stockIndices ?? null,
        macroStats: macroStats ?? null,
        regionalIndices: regionalIndices ?? null,
        creditRates: creditRates ?? null,
        vcAnalytics: vcAnalytics ?? null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      // Только реальные данные: если не смогли получить — явно возвращаем пустые структуры
      return {
        exchangeRates: null,
        cryptoData: null,
        stockIndices: null,
        macroStats: null,
        regionalIndices: null,
        creditRates: null,
        vcAnalytics: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getExchangeRates() {
    try {
      console.log('Fetching exchange rates from fxratesapi.com...');
      const response = await axios.get('https://api.fxratesapi.com/latest', {
        timeout: 5000
      });
      
      console.log('FxRatesAPI response:', response.data);
      
      return {
        base: 'USD',
        rates: {
          EUR: response.data.rates.EUR,
          GBP: response.data.rates.GBP,
          JPY: response.data.rates.JPY,
          CAD: response.data.rates.CAD,
          AUD: response.data.rates.AUD
        },
        lastUpdated: response.data.date
      };
    } catch (error) {
      console.error('Exchange rates API error:', error.message);
      // Пробуем альтернативный API
      try {
        console.log('Trying alternative exchange rates API...');
        const altResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
          timeout: 5000
        });
        
        console.log('ExchangeRate-API response:', altResponse.data);
        
        return {
          base: 'USD',
          rates: {
            EUR: altResponse.data.rates.EUR,
            GBP: altResponse.data.rates.GBP,
            JPY: altResponse.data.rates.JPY,
            CAD: altResponse.data.rates.CAD,
            AUD: altResponse.data.rates.AUD
          },
          lastUpdated: altResponse.data.date
        };
      } catch (altError) {
        console.error('Alternative exchange rates API error:', altError.message);
        // Не используем статичные данные: если ничего не удалось получить, вернем null
        return null;
      }
    }
  }

  private async getCryptoData() {
    try {
      console.log('Fetching real crypto data from CoinGecko...');
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum,binancecoin,cardano,solana',
          vs_currencies: 'usd',
          include_24hr_change: true
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BusinessUnion/1.0'
        }
      });
      
      console.log('CoinGecko response:', response.data);
      
      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error('Empty response from CoinGecko');
      }
      
      return {
        bitcoin: {
          price: response.data.bitcoin?.usd || 0,
          change24h: response.data.bitcoin?.usd_24h_change || 0
        },
        ethereum: {
          price: response.data.ethereum?.usd || 0,
          change24h: response.data.ethereum?.usd_24h_change || 0
        },
        binancecoin: {
          price: response.data.binancecoin?.usd || 0,
          change24h: response.data.binancecoin?.usd_24h_change || 0
        },
        cardano: {
          price: response.data.cardano?.usd || 0,
          change24h: response.data.cardano?.usd_24h_change || 0
        },
        solana: {
          price: response.data.solana?.usd || 0,
          change24h: response.data.solana?.usd_24h_change || 0
        }
      };
    } catch (error) {
      console.error('Crypto API error:', error.message);
      // Без моков: если реальный API не доступен, вернем null
      return null;
    }
  }

  private async getStockIndices() {
    try {
      // Используем Alpha Vantage API для получения индексов
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        console.log('No Alpha Vantage API key, using mock stock indices');
        return this.getMockStockIndices();
      }

      console.log('Fetching stock indices from Alpha Vantage...');
      
      // Используем ETF символы, которые точно работают
      const [sp500, nasdaq, dow] = await Promise.all([
        axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${apiKey}`, { timeout: 10000 }),
        axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=${apiKey}`, { timeout: 10000 }),
        axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=DIA&apikey=${apiKey}`, { timeout: 10000 })
      ]);

      console.log('Alpha Vantage responses:', {
        sp500: sp500.data,
        nasdaq: nasdaq.data,
        dow: dow.data
      });
      
      // Проверяем, есть ли данные в ответах
      if (!sp500.data['Global Quote'] || !nasdaq.data['Global Quote'] || !dow.data['Global Quote']) {
        console.log('No stock data in Alpha Vantage response');
        return null;
      }
      
      return {
        sp500: {
          price: parseFloat(sp500.data['Global Quote']['05. price'] || 0),
          change: parseFloat(sp500.data['Global Quote']['09. change'] || 0),
          changePercent: sp500.data['Global Quote']['10. change percent'] || '0%'
        },
        nasdaq: {
          price: parseFloat(nasdaq.data['Global Quote']['05. price'] || 0),
          change: parseFloat(nasdaq.data['Global Quote']['09. change'] || 0),
          changePercent: nasdaq.data['Global Quote']['10. change percent'] || '0%'
        },
        dow: {
          price: parseFloat(dow.data['Global Quote']['05. price'] || 0),
          change: parseFloat(dow.data['Global Quote']['09. change'] || 0),
          changePercent: dow.data['Global Quote']['10. change percent'] || '0%'
        }
      };
    } catch (error) {
      console.error('Stock indices API error:', error.message);
      // Только реальные данные: при ошибке вернем null
      return null;
    }
  }

  /**
   * Базовые макроэкономические показатели.
   * Здесь используются агрегированные/усреднённые значения.
   * При необходимости можно заменить на реальные данные из внешнего API.
   */
  /**
   * Макроэкономические показатели.
   * 1) Если задан внешний API (MACRO_STATS_API_URL) — берем данные оттуда.
   * 2) Иначе пробуем получить инфляцию/безработицу из World Bank API.
   * 3) Если что-то пошло не так — возвращаем стабильные fallback-значения.
   */
  private async getMacroStats() {
    // Вариант 1: ваш собственный агрегирующий API (формат такой же, как ниже)
    const externalUrl = process.env.MACRO_STATS_API_URL;
    if (externalUrl) {
      try {
        console.log('Fetching macro stats from external API:', externalUrl);
        const { data } = await axios.get(externalUrl, { timeout: 10000 });
        if (data && data.inflationCpi && data.policyRates && data.unemployment && data.consumerConfidence) {
          return data;
        }
        console.warn('External macro stats API returned unexpected shape, falling back to public APIs');
      } catch (error) {
        console.error('External macro stats API error:', error.message);
      }
    }

    // Вариант 2: открытые публичные данные (World Bank)
    try {
      console.log('Fetching macro stats from World Bank API...');
      const [worldInfl, usInfl, euInfl, usUnemp, euUnemp, ruUnemp] = await Promise.all([
        axios.get('https://api.worldbank.org/v2/country/WLD/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1', { timeout: 10000 }),
        axios.get('https://api.worldbank.org/v2/country/USA/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1', { timeout: 10000 }),
        axios.get('https://api.worldbank.org/v2/country/EMU/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1', { timeout: 10000 }),
        axios.get('https://api.worldbank.org/v2/country/USA/indicator/SL.UEM.TOTL.ZS?format=json&per_page=1', { timeout: 10000 }),
        axios.get('https://api.worldbank.org/v2/country/EMU/indicator/SL.UEM.TOTL.ZS?format=json&per_page=1', { timeout: 10000 }),
        axios.get('https://api.worldbank.org/v2/country/RUS/indicator/SL.UEM.TOTL.ZS?format=json&per_page=1', { timeout: 10000 }),
      ]);

      const extractValue = (resp: any) => {
        if (!Array.isArray(resp.data) || !Array.isArray(resp.data[1]) || !resp.data[1][0]) return null;
        return resp.data[1][0].value;
      };

      const inflationCpi = {
        global: extractValue(worldInfl) ?? 4.1,
        us: extractValue(usInfl) ?? 3.2,
        eu: extractValue(euInfl) ?? 2.8,
      };

      const unemployment = {
        us: extractValue(usUnemp) ?? 4.0,
        eu: extractValue(euUnemp) ?? 6.2,
        russia: extractValue(ruUnemp) ?? 3.1,
      };

      // Ставки и доверие потребителей лучше брать из вашего кастомного API;
      // здесь оставляем разумные fallback'и.
      const policyRates = {
        fed: 5.5,
        ecb: 4.25,
        russia: 16.0,
      };

      const consumerConfidence = {
        us: 98,
        eu: 92,
        russia: 85,
      };

      return {
        inflationCpi,
        policyRates,
        unemployment,
        consumerConfidence,
      };
    } catch (error) {
      console.error('World Bank macro stats API error, using fallback values:', error.message);
      return {
        inflationCpi: {
          global: 4.1,
          us: 3.2,
          eu: 2.8,
        },
        policyRates: {
          fed: 5.5,
          ecb: 4.25,
          russia: 16.0,
        },
        unemployment: {
          us: 4.0,
          eu: 6.2,
          russia: 3.1,
        },
        consumerConfidence: {
          us: 98,
          eu: 92,
          russia: 85,
        },
      };
    }
  }

  /**
   * Расширенные региональные индексы: Россия, Европа, Азия.
   * Часть данных берётся из уже полученных индексов (S&P 500, Nasdaq, Dow),
   * остальное – как агрегированные ориентиры.
   */
  private async getRegionalIndices(stockIndices: any) {
    // Вариант 1: внешний API с уже подготовленными региональными индексами
    const externalUrl = process.env.REGIONAL_INDICES_API_URL;
    if (externalUrl) {
      try {
        console.log('Fetching regional indices from external API:', externalUrl);
        const { data } = await axios.get(externalUrl, { timeout: 10000 });
        if (data && data.globalBenchmarks && data.russian && data.european && data.asian && data.sectors) {
          return data;
        }
        console.warn('External regional indices API returned unexpected shape, using local aggregation');
      } catch (error) {
        console.error('External regional indices API error:', error.message);
      }
    }

    // Вариант 2: используем уже полученные американские индексы + статический fallback по остальным регионам
    // Проверяем, что stockIndices не null
    const defaultIndex = { price: 0, change: 0, changePercent: '0%' };
    return {
      globalBenchmarks: {
        sp500: stockIndices?.sp500 ?? defaultIndex,
        nasdaq: stockIndices?.nasdaq ?? defaultIndex,
        dow: stockIndices?.dow ?? defaultIndex,
      },
      russian: [
        { name: 'MOEX', price: 3250, changePercent: '+0.4%' },
        { name: 'RTSI', price: 1150, changePercent: '+0.2%' },
      ],
      european: [
        { name: 'DAX', price: 18200, changePercent: '+0.3%' },
        { name: 'FTSE 100', price: 8200, changePercent: '-0.1%' },
        { name: 'CAC 40', price: 7600, changePercent: '+0.2%' },
      ],
      asian: [
        { name: 'Nikkei 225', price: 38500, changePercent: '+0.5%' },
        { name: 'Hang Seng', price: 18800, changePercent: '-0.3%' },
      ],
      sectors: [
        { name: 'Технологии', weight: 32, performance: '+1.8%' },
        { name: 'Финансы', weight: 18, performance: '+0.6%' },
        { name: 'Фармацевтика', weight: 12, performance: '+0.9%' },
        { name: 'Энергетика', weight: 10, performance: '-0.4%' },
        { name: 'Потребительский сектор', weight: 15, performance: '+0.3%' },
      ],
    };
  }

  /**
   * Ориентировочные ставки кредитов и риски по регионам.
   */
  private async getCreditRates() {
    const externalUrl = process.env.CREDIT_RATES_API_URL;
    if (externalUrl) {
      try {
        console.log('Fetching credit rates from external API:', externalUrl);
        const { data } = await axios.get(externalUrl, { timeout: 10000 });
        if (data && typeof data.businessLoans !== 'undefined') {
          return data;
        }
        console.warn('External credit rates API returned unexpected shape, using fallback');
      } catch (error) {
        console.error('External credit rates API error:', error.message);
      }
    }

    return {
      businessLoans: 12.5,
      investorLoans: 10.2,
      vcFundsCost: 18.0,
      regionalRisks: [
        { region: 'США', level: 'средний', score: 0.45 },
        { region: 'Европа', level: 'средний', score: 0.5 },
        { region: 'Россия', level: 'повышенный', score: 0.7 },
        { region: 'Азия', level: 'умеренный', score: 0.55 },
      ],
    };
  }

  /**
   * Сводка по венчурной активности и раундам.
   */
  private async getVcAnalytics() {
    const externalUrl = process.env.VC_ANALYTICS_API_URL;
    if (externalUrl) {
      try {
        console.log('Fetching VC analytics from external API:', externalUrl);
        const { data } = await axios.get(externalUrl, { timeout: 10000 });
        if (data && data.vcActivity && data.roundsGrowth && data.dealsByStage) {
          return data;
        }
        console.warn('External VC analytics API returned unexpected shape, using fallback');
      } catch (error) {
        console.error('External VC analytics API error:', error.message);
      }
    }

    return {
      vcActivity: {
        dealsLastMonth: 120,
        totalVolumeUsd: 1_800_000_000,
      },
      roundsGrowth: {
        preSeed: 8.5,
        seed: 6.2,
        seriesA: 4.1,
      },
      dealsByStage: {
        preSeed: 35,
        seed: 55,
        seriesA: 30,
      },
      ipoTrends: {
        recentIpos: 12,
        upcomingPreIpo: 18,
        sentiment: 'умеренно позитивный',
      },
      industryForecasts: [
        { sector: 'AI / ML', horizon: '3 года', outlook: 'ускоренный рост' },
        { sector: 'FinTech', horizon: '3 года', outlook: 'стабильный рост' },
        { sector: 'HealthTech', horizon: '5 лет', outlook: 'выше рынка' },
        { sector: 'Web3 / Crypto', horizon: '5 лет', outlook: 'волатильный рост' },
      ],
    };
  }

  async getIndustryTrends() {
    try {
      console.log('Fetching industry trends...');
      
      // Получаем новости рынка
      const marketNews = await this.getMarketNews();
      
      // Анализируем тренды по категориям проектов
      const categoryTrends = await this.getCategoryTrends();
      
      return {
        marketNews,
        categoryTrends,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching industry trends:', error);
      return this.getMockIndustryTrends();
    }
  }

  private async getMarketNews() {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        console.log('No Alpha Vantage API key, using mock news');
        return this.getMockMarketNews();
      }
      
      console.log('Fetching real market news from Alpha Vantage...');
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'NEWS_SENTIMENT',
          apikey: apiKey,
          topics: 'technology,finance,blockchain',
          sort: 'LATEST',
          limit: 5
        },
        timeout: 10000
      });
      
      console.log('Alpha Vantage news response:', response.data);
      
      if (response.data.feed && Array.isArray(response.data.feed)) {
        return response.data.feed.slice(0, 5).map(article => ({
          title: article.title,
          summary: article.summary,
          url: article.url,
          publishedDate: article.time_published,
          sentiment: article.overall_sentiment_score
        }));
      } else {
        console.log('No news feed in response, using mock data');
        return this.getMockMarketNews();
      }
    } catch (error) {
      console.error('Market news API error:', error.message);
      return this.getMockMarketNews();
    }
  }

  private async getCategoryTrends() {
    try {
      const categories = await this.projectRepository
        .createQueryBuilder('project')
        .select('project.category', 'category')
        .addSelect('COUNT(project.id)', 'count')
        .addSelect('AVG(project.expectedRoi)', 'avgRoi')
        .addSelect('SUM(project.investmentNeeded)', 'totalInvestment')
        .groupBy('project.category')
        .orderBy('count', 'DESC')
        .getRawMany();

      return categories.map(cat => ({
        name: cat.category?.name || 'Не указано',
        projectCount: parseInt(cat.count),
        averageRoi: parseFloat(cat.avgRoi) || 0,
        totalInvestment: parseFloat(cat.totalInvestment) || 0
      }));
    } catch (error) {
      console.error('Error fetching category trends:', error);
      return [];
    }
  }

  private getMockMarketNews() {
    return [
      {
        title: 'Federal Reserve signals potential rate cuts amid economic uncertainty',
        summary: 'The Fed\'s latest policy statement suggests a more dovish stance as inflation concerns ease and economic growth slows.',
        url: 'https://example.com/news1',
        publishedDate: new Date().toISOString(),
        sentiment: 0.3
      },
      {
        title: 'Tech stocks rally on strong earnings reports from major companies',
        summary: 'Major technology companies report better-than-expected quarterly results, driving market optimism.',
        url: 'https://example.com/news2',
        publishedDate: new Date(Date.now() - 3600000).toISOString(),
        sentiment: 0.8
      },
      {
        title: 'Cryptocurrency market shows signs of recovery after recent volatility',
        summary: 'Digital assets gain traction as institutional investors show renewed interest in blockchain technology.',
        url: 'https://example.com/news3',
        publishedDate: new Date(Date.now() - 7200000).toISOString(),
        sentiment: 0.6
      },
      {
        title: 'Global supply chain disruptions impact manufacturing sector',
        summary: 'Recent geopolitical tensions continue to affect global trade and supply chain efficiency.',
        url: 'https://example.com/news4',
        publishedDate: new Date(Date.now() - 10800000).toISOString(),
        sentiment: -0.2
      },
      {
        title: 'Renewable energy investments reach record highs',
        summary: 'Clean energy sector attracts unprecedented funding as governments prioritize sustainability initiatives.',
        url: 'https://example.com/news5',
        publishedDate: new Date(Date.now() - 14400000).toISOString(),
        sentiment: 0.9
      }
    ];
  }

  private getMockIndustryTrends() {
    return {
      marketNews: this.getMockMarketNews(),
      categoryTrends: [
        { name: 'Технологии', projectCount: 15, averageRoi: 35, totalInvestment: 2500000 },
        { name: 'Финансы', projectCount: 8, averageRoi: 28, totalInvestment: 1800000 },
        { name: 'Здравоохранение', projectCount: 6, averageRoi: 32, totalInvestment: 1200000 }
      ],
      timestamp: new Date().toISOString()
    };
  }

  async debug() {
    try {
      console.log('=== DEBUG: Checking database data ===');
      
      // Проверяем проекты
      const allProjects = await this.projectRepository.find();
      console.log('All projects count:', allProjects.length);
      console.log('Projects:', allProjects.map(p => ({ id: p.id, title: p.title, status: p.status, expectedRoi: p.expectedRoi })));
      
      // Проверяем инвестиции
      const allInvestments = await this.investmentRepository.find();
      console.log('All investments count:', allInvestments.length);
      console.log('Investments:', allInvestments.map(i => ({ id: i.id, amount: i.amount, status: i.status })));
      
      // Проверяем пользователей
      const allUsers = await this.userRepository.find();
      console.log('All users count:', allUsers.length);
      
      return {
        projects: {
          count: allProjects.length,
          data: allProjects.map(p => ({ id: p.id, title: p.title, status: p.status, expectedRoi: p.expectedRoi }))
        },
        investments: {
          count: allInvestments.length,
          data: allInvestments.map(i => ({ id: i.id, amount: i.amount, status: i.status }))
        },
        users: {
          count: allUsers.length
        }
      };
    } catch (error) {
      console.error('Debug error:', error);
      return { error: error.message };
    }
  }
}
