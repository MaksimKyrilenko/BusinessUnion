import { Injectable } from '@nestjs/common';
import { UserRole } from '../users/enums/user-role.enum';
import {
  DashboardStats,
  RecentMessage,
  Activity,
  StartupInfo,
  StartupMilestone,
  StartupMetrics,
  StartupUpdate,
  StartupMentor,
  InvestorStats,
  PendingProject,
  InvestorTransaction,
  CryptoStats,
  CryptoPosition,
  CryptoTransaction,
  CryptoMarket
} from './interfaces';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

@Injectable()
export class DashboardService {
  private readonly exchangeRatesApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('EXCHANGE_RATES_API_KEY');
    if (!apiKey) {
      console.warn('EXCHANGE_RATES_API_KEY не настроен, будут использоваться тестовые данные');
    }
    this.exchangeRatesApiKey = apiKey || '';
  }

  async getStats(role: UserRole, userId: number): Promise<DashboardStats> {
    // TODO: Реализовать получение реальных данных из базы
    return {
      totalConnections: 150,
      unreadMessages: 5,
      pendingRequests: 3,
      recentActivities: 10
    };
  }

  async getRecentMessages(userId: number): Promise<RecentMessage[]> {
    // TODO: Реализовать получение реальных сообщений из базы
    return [
      {
        id: 1,
        senderId: 2,
        senderName: 'Иван Петров',
        content: 'Добрый день! Хотел обсудить ваш проект...',
        timestamp: new Date(),
        isRead: false
      }
    ];
  }

  async getActivities(userId: number): Promise<Activity[]> {
    // TODO: Реализовать получение реальных активностей из базы
    return [
      {
        id: 1,
        type: 'connection',
        title: 'Новое подключение',
        description: 'Анна Сидорова подключилась к вашей сети',
        timestamp: new Date()
      }
    ];
  }

  // Методы для стартапера
  async getStartupInfo(userId: number): Promise<StartupInfo> {
    // TODO: Реализовать получение реальных данных стартапа из базы
    return {
      name: 'TechStartup',
      stage: 'Seed',
      industry: 'AI/ML',
      teamSize: 5,
      fundingGoal: 1000000,
      currentFunding: 250000
    };
  }

  async getStartupMilestones(userId: number): Promise<StartupMilestone[]> {
    // TODO: Реализовать получение реальных вех из базы
    return [
      {
        id: 1,
        title: 'MVP Релиз',
        description: 'Выпуск минимально жизнеспособного продукта',
        dueDate: new Date('2024-06-01'),
        status: 'pending'
      }
    ];
  }

  async getStartupMetrics(userId: number): Promise<StartupMetrics> {
    // TODO: Реализовать получение реальных метрик из базы
    return {
      revenue: 50000,
      users: 1000,
      growth: 15,
      burnRate: 20000,
      runway: 12
    };
  }

  async getStartupUpdates(userId: number): Promise<StartupUpdate[]> {
    // TODO: Реализовать получение реальных обновлений из базы
    return [
      {
        id: 1,
        title: 'Новый функционал',
        content: 'Добавлена интеграция с AI',
        timestamp: new Date(),
        type: 'product'
      }
    ];
  }

  async getStartupMentors(userId: number): Promise<StartupMentor[]> {
    // TODO: Реализовать получение реальных менторов из базы
    return [
      {
        id: 1,
        name: 'Михаил Иванов',
        expertise: ['AI/ML', 'Product Management'],
        company: 'Tech Giants Inc',
        position: 'Product Director',
        availability: true
      }
    ];
  }

  // Методы для инвестора
  async getInvestorStats(userId: number): Promise<InvestorStats> {
    // TODO: Реализовать получение реальной статистики инвестора из базы
    return {
      totalInvestments: 10,
      activeInvestments: 7,
      totalAmount: 5000000,
      averageReturn: 25,
      portfolioValue: 6250000
    };
  }

  async getPendingProjects(userId: number): Promise<PendingProject[]> {
    // TODO: Реализовать получение реальных проектов из базы
    return [
      {
        id: 1,
        name: 'AI Platform',
        industry: 'Technology',
        stage: 'Seed',
        requestedAmount: 500000,
        equity: 10,
        submitDate: new Date()
      }
    ];
  }

  async getInvestorTransactions(userId: number): Promise<InvestorTransaction[]> {
    // TODO: Реализовать получение реальных транзакций из базы
    return [
      {
        id: 1,
        projectId: 1,
        projectName: 'AI Platform',
        amount: 500000,
        type: 'investment',
        date: new Date(),
        status: 'completed'
      }
    ];
  }

  // Методы для крипто-трейдера
  async getCryptoStats(userId: number): Promise<CryptoStats> {
    // TODO: Реализовать получение реальной крипто-статистики из базы
    return {
      totalPortfolioValue: 100000,
      dailyPnL: 5000,
      weeklyPnL: 15000,
      monthlyPnL: 50000,
      totalTrades: 100,
      winRate: 65
    };
  }

  async getCryptoPositions(userId: number): Promise<CryptoPosition[]> {
    // TODO: Реализовать получение реальных позиций из базы
    return [
      {
        id: 1,
        symbol: 'BTC/USDT',
        amount: 1.5,
        entryPrice: 40000,
        currentPrice: 45000,
        pnl: 7500,
        openDate: new Date()
      }
    ];
  }

  async getCryptoTransactions(userId: number): Promise<CryptoTransaction[]> {
    // TODO: Реализовать получение реальных транзакций из базы
    return [
      {
        id: 1,
        symbol: 'BTC/USDT',
        type: 'buy',
        amount: 1.5,
        price: 40000,
        total: 60000,
        fee: 60,
        timestamp: new Date()
      }
    ];
  }

  async getCryptoMarket(): Promise<CryptoMarket[]> {
    // TODO: Реализовать получение реальных рыночных данных из API
    return [
      {
        symbol: 'BTC/USDT',
        price: 45000,
        change24h: 5.5,
        volume24h: 1000000000,
        marketCap: 850000000000,
        lastUpdate: new Date()
      }
    ];
  }

  async getNews() {
    // В реальном приложении здесь будет запрос к API новостей
    return [
      {
        id: 1,
        category: 'Финансы',
        title: 'Новые тренды в инвестировании 2024',
        description: 'Анализ основных трендов в сфере инвестиций на текущий год',
        date: new Date(),
        url: '#'
      },
      {
        id: 2,
        category: 'Стартапы',
        title: 'Успешные стартапы первого квартала',
        description: 'Обзор самых перспективных стартапов начала года',
        date: new Date(),
        url: '#'
      },
      {
        id: 3,
        category: 'Криптовалюты',
        title: 'Анализ рынка криптовалют',
        description: 'Текущая ситуация на рынке криптовалют и прогнозы аналитиков',
        date: new Date(),
        url: '#'
      }
    ];
  }

  async getEvents() {
    // В реальном приложении здесь будет запрос к базе данных или API событий
    return [
      {
        id: 1,
        title: 'Конференция инвесторов 2024',
        description: 'Ежегодная конференция для инвесторов и предпринимателей',
        date: new Date('2024-04-15'),
        location: 'Москва, Экспоцентр'
      },
      {
        id: 2,
        title: 'Мастер-класс по криптотрейдингу',
        description: 'Практический мастер-класс от ведущих трейдеров',
        date: new Date('2024-04-20'),
        location: 'Онлайн'
      },
      {
        id: 3,
        title: 'Питч-сессия стартапов',
        description: 'Презентации стартапов перед инвесторами',
        date: new Date('2024-04-25'),
        location: 'Санкт-Петербург, Технопарк'
      }
    ];
  }

  async getExchangeRates() {
    try {
      if (!this.exchangeRatesApiKey) {
        // Возвращаем тестовые данные, если API ключ не настроен
        return {
          USD: { rate: 91.25, change: 0.5 },
          EUR: { rate: 98.75, change: -0.3 },
          GBP: { rate: 115.50, change: 0.2 },
          CNY: { rate: 12.65, change: 0.1 },
          JPY: { rate: 0.61, change: -0.2 }
        };
      }

      const response = await lastValueFrom(
        this.httpService.get<ExchangeRateResponse>('https://api.exchangerate-api.com/v4/latest/RUB', {
          headers: {
            'Authorization': `Bearer ${this.exchangeRatesApiKey}`
          }
        })
      );

      // Преобразуем ответ API в нужный формат
      const rates = response.data.rates;
      return Object.keys(rates).reduce((acc, currency) => {
        acc[currency] = {
          rate: 1 / rates[currency],
          // В реальном приложении здесь будет расчет изменения курса
          change: Math.random() * 2 - 1
        };
        return acc;
      }, {} as Record<string, { rate: number; change: number }>);
    } catch (error) {
      console.error('Ошибка при получении курсов валют:', error);
      throw error;
    }
  }
} 