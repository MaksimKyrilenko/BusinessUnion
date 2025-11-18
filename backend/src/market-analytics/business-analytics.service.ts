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
      
      return {
        exchangeRates,
        cryptoData,
        stockIndices,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      return this.getMockEconomicIndicators();
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
        console.log('Using fallback exchange rates');
        return {
          base: 'USD',
          rates: {
            EUR: 0.95, // Более реалистичные значения
            GBP: 0.78,
            JPY: 150.0,
            CAD: 1.35,
            AUD: 1.50
          },
          lastUpdated: new Date().toISOString().split('T')[0]
        };
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
      console.log('Using fallback crypto data');
      return {
        bitcoin: { price: 65000, change24h: 2.5 },
        ethereum: { price: 3500, change24h: -1.2 },
        binancecoin: { price: 600, change24h: 1.8 },
        cardano: { price: 0.45, change24h: 3.2 },
        solana: { price: 150, change24h: -0.8 }
      };
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
        console.log('No stock data in Alpha Vantage response, using mock data');
        return this.getMockStockIndices();
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
      return this.getMockStockIndices();
    }
  }

  private getMockStockIndices() {
    return {
      sp500: { price: 5500, change: 15.5, changePercent: '+0.28%' },
      nasdaq: { price: 18000, change: -25.3, changePercent: '-0.14%' },
      dow: { price: 38000, change: 45.2, changePercent: '+0.12%' }
    };
  }

  private getMockEconomicIndicators() {
    return {
      exchangeRates: {
        base: 'USD',
        rates: { EUR: 0.85, GBP: 0.73, JPY: 110.0, CAD: 1.25, AUD: 1.35 },
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      cryptoData: {
        bitcoin: { price: 45000, change24h: 2.5 },
        ethereum: { price: 3200, change24h: -1.2 },
        binancecoin: { price: 300, change24h: 1.8 },
        cardano: { price: 0.45, change24h: 3.2 },
        solana: { price: 95, change24h: -0.8 }
      },
      stockIndices: {
        sp500: { price: 4500, change: 15.5, changePercent: '+0.35%' },
        nasdaq: { price: 15000, change: -25.3, changePercent: '-0.17%' },
        dow: { price: 35000, change: 45.2, changePercent: '+0.13%' }
      },
      timestamp: new Date().toISOString()
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
