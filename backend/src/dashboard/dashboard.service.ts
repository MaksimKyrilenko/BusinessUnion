import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
  CryptoMarket,
  CommunityActivity,
  CommunityStats
} from './interfaces';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../chat/entities/chat.entity';
import { Message } from '../chat/entities/message.entity';
import { ChatUser } from '../chat/entities/chat-user.entity';
import { ChatType } from '../chat/enums/chat-type.enum';
import { Event } from '../events/entities/event.entity';
import { EducationService } from '../education/education.service';
import { BusinessAnalyticsService } from '../market-analytics/business-analytics.service';
import { CommunitiesService } from '../communities/communities.service';
import { CommunityMember } from '../communities/entities/community-member.entity';
import { CommunityPost } from '../communities/entities/community-post.entity';
import { CommunityPostReaction } from '../communities/entities/community-post-reaction.entity';

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

@Injectable()
export class DashboardService {
  private readonly exchangeRatesApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatUser)
    private chatUserRepository: Repository<ChatUser>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    @InjectRepository(CommunityPost)
    private communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityPostReaction)
    private communityPostReactionRepository: Repository<CommunityPostReaction>,
    @Inject(forwardRef(() => EducationService))
    private readonly educationService: EducationService,
    @Inject(forwardRef(() => BusinessAnalyticsService))
    private readonly businessAnalyticsService: BusinessAnalyticsService,
    @Inject(forwardRef(() => CommunitiesService))
    private readonly communitiesService: CommunitiesService,
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

  async getRecentMessages(userId: number, limit: number = 10): Promise<RecentMessage[]> {
    try {
      // Получаем все чаты пользователя
      const chatUsers = await this.chatUserRepository.find({
        where: { userId },
        relations: ['chat'],
      });

      const chatIds = chatUsers.map(cu => cu.chatId);
      
      if (chatIds.length === 0) {
        return [];
      }

      // Получаем последние сообщения из всех чатов пользователя
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('message.chat', 'chat')
        .where('message.chatId IN (:...chatIds)', { chatIds })
        .orderBy('message.createdAt', 'DESC')
        .limit(limit)
        .getMany();

      // Преобразуем в формат RecentMessage
      return messages.map(message => ({
        id: message.id,
        senderId: message.senderId,
        senderName: `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || 'Неизвестный',
        content: message.text,
        timestamp: message.createdAt,
        isRead: false, // TODO: Реализовать проверку прочитанности
        chatId: message.chatId,
        chatName: message.chat?.name || 'Личный чат',
        chatType: message.chat?.type || ChatType.PERSONAL
      }));
    } catch (error) {
      console.error('Ошибка при получении недавних сообщений:', error);
      return [];
    }
  }

  async getMessageStats(userId: number) {
    try {
      // Получаем все чаты пользователя
      const chatUsers = await this.chatUserRepository.find({
        where: { userId },
        relations: ['chat'],
      });

      const chatIds = chatUsers.map(cu => cu.chatId);
      
      if (chatIds.length === 0) {
        return {
          personal: 0,
          group: 0,
          notifications: 0
        };
      }

      // Получаем чаты с их типами
      const chats = await this.chatRepository
        .createQueryBuilder('chat')
        .where('chat.id IN (:...chatIds)', { chatIds })
        .getMany();

      // Подсчитываем непрочитанные сообщения
      let personalUnread = 0;
      let groupUnread = 0;

      for (const chatUser of chatUsers) {
        const unreadCount = chatUser.unreadCount || 0;
        const chat = chats.find(c => c.id === chatUser.chatId);
        
        if (chat?.type === ChatType.PERSONAL) {
          personalUnread += unreadCount;
        } else if (chat?.type === ChatType.GROUP) {
          groupUnread += unreadCount;
        }
      }

      return {
        personal: personalUnread,
        group: groupUnread,
        notifications: 0 // TODO: Реализовать подсчет уведомлений
      };
    } catch (error) {
      console.error('Ошибка при получении статистики сообщений:', error);
      return {
        personal: 0,
        group: 0,
        notifications: 0
      };
    }
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

  async getRecommendedCourses(limit: number = 6) {
    try {
      // Получаем курсы из EducationService
      const allCourses = await this.educationService.getCourses();
      
      // Берем первые N курсов как рекомендуемые
      const recommended = allCourses.slice(0, limit);
      
      // Преобразуем в формат для дашборда
      return recommended.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        duration: course.duration || 'Не указано',
        level: course.level || 'Не указано',
        icon: course.icon || '📚',
        platform: course.platform || 'unknown',
        url: course.url || '#'
      }));
    } catch (error) {
      console.error('Ошибка при получении рекомендуемых курсов:', error);
      // Возвращаем тестовые данные в случае ошибки
      return [
        {
          id: 1,
          title: 'Основы стартапов',
          description: 'Узнайте как создать успешный стартап с нуля',
          duration: '8 недель',
          level: 'Начальный',
          icon: '🚀',
          platform: 'coursera',
          url: '#'
        },
        {
          id: 2,
          title: 'Инвестиционный анализ',
          description: 'Научитесь оценивать инвестиционные возможности',
          duration: '6 недель',
          level: 'Продвинутый',
          icon: '📈',
          platform: 'udemy',
          url: '#'
        }
      ];
    }
  }

  async getMarketTrends(limit: number = 5) {
    try {
      // Получаем прогноз рынка из BusinessAnalyticsService
      const marketForecast = await this.businessAnalyticsService.getMarketForecast();
      
      // Преобразуем тренды из прогноза в формат для дашборда
      const trends: any[] = [];
      
      if (marketForecast && marketForecast.trends && Array.isArray(marketForecast.trends)) {
        marketForecast.trends.slice(0, limit).forEach((trendText: string, index: number) => {
          // Определяем категорию по тексту тренда
          let category = 'Общее';
          if (trendText.toLowerCase().includes('ai') || trendText.toLowerCase().includes('ml') || trendText.toLowerCase().includes('технологи')) {
            category = 'Технологии';
          } else if (trendText.toLowerCase().includes('экологи') || trendText.toLowerCase().includes('зелен')) {
            category = 'Экология';
          } else if (trendText.toLowerCase().includes('web3') || trendText.toLowerCase().includes('крипто') || trendText.toLowerCase().includes('блокчейн')) {
            category = 'Крипто';
          } else if (trendText.toLowerCase().includes('безопасност')) {
            category = 'Безопасность';
          }
          
          trends.push({
            id: index + 1,
            category: category,
            title: trendText,
            description: `Тренд рынка: ${trendText}`,
            change: marketForecast.marketGrowth || 15
          });
        });
      }
      
      // Если трендов нет, используем прогноз роста
      if (trends.length === 0 && marketForecast) {
        trends.push({
          id: 1,
          category: 'Прогноз',
          title: `Рост рынка: ${marketForecast.marketGrowth}%`,
          description: 'Прогнозируемый рост рынка на следующий период',
          change: marketForecast.marketGrowth || 15
        });
      }
      
      return trends.length > 0 ? trends : this.getDefaultMarketTrends();
    } catch (error) {
      console.error('Ошибка при получении трендов рынка:', error);
      return this.getDefaultMarketTrends();
    }
  }

  private getDefaultMarketTrends() {
    return [
      {
        id: 1,
        category: 'Технологии',
        title: 'Рост инвестиций в AI',
        description: 'Увеличение инвестиций в проекты с искусственным интеллектом',
        change: 15.5
      },
      {
        id: 2,
        category: 'Финансы',
        title: 'Развитие финтех-сектора',
        description: 'Активное развитие финансовых технологий',
        change: 12.3
      },
      {
        id: 3,
        category: 'Экология',
        title: 'Зеленые технологии',
        description: 'Рост интереса к экологическим проектам',
        change: 8.7
      }
    ];
  }

  async getNews(limit: number = 5) {
    try {
      // Получаем недавние события, которые можно использовать как новости
      const recentEvents = await this.eventRepository.find({
        order: { createdAt: 'DESC' },
        take: limit,
        relations: ['createdBy'],
      });

      // Преобразуем события в формат новостей
      const newsFromEvents = recentEvents.map(event => ({
        id: event.id,
        category: 'События',
        title: event.title,
        description: event.description || '',
        date: event.createdAt || event.date,
        url: `/events/${event.id}`
      }));

      // Если есть события, возвращаем их
      if (newsFromEvents.length > 0) {
        return newsFromEvents;
      }

      // Иначе возвращаем тестовые данные
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
        }
      ];
    } catch (error) {
      console.error('Ошибка при получении новостей:', error);
      // Возвращаем тестовые данные в случае ошибки
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
        }
      ];
    }
  }

  async getEvents(limit: number = 5) {
    try {
      // Получаем ближайшие события
      const now = new Date();
      const upcomingEvents = await this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.createdBy', 'createdBy')
        .leftJoinAndSelect('event.participants', 'participants')
        .where('event.date >= :now', { now })
        .orderBy('event.date', 'ASC')
        .take(limit)
        .getMany();

      return upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.date,
        location: event.location || 'Не указано',
        participantsCount: event.participants?.length || 0
      }));
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
      // Возвращаем тестовые данные в случае ошибки
      return [
        {
          id: 1,
          title: 'Конференция инвесторов 2024',
          description: 'Ежегодная конференция для инвесторов и предпринимателей',
          date: new Date('2024-04-15'),
          location: 'Москва, Экспоцентр'
        }
      ];
    }
  }

  async getExchangeRates() {
    try {
      if (!this.exchangeRatesApiKey) {
        // Возвращаем тестовые данные, если API ключ не настроен
        console.log('API ключ не настроен, возвращаем тестовые данные');
        return {
          USD: { rate: 91.25, change: 0.5 },
          EUR: { rate: 98.75, change: -0.3 },
          GBP: { rate: 115.50, change: 0.2 },
          CNY: { rate: 12.65, change: 0.1 },
          JPY: { rate: 0.61, change: -0.2 },
          RUB: { rate: 1, change: 0 }
        };
      }

      try {
        const response = await lastValueFrom(
          this.httpService.get<ExchangeRateResponse>('https://api.exchangerate-api.com/v4/latest/RUB', {
            timeout: 5000
          })
        );

        // Преобразуем ответ API в нужный формат
        const rates = response.data.rates;
        const result = Object.keys(rates).reduce((acc, currency) => {
          acc[currency] = {
            rate: rates[currency], // Курс валюты к рублю
            // В реальном приложении здесь будет расчет изменения курса
            change: Math.random() * 2 - 1
          };
          return acc;
        }, {} as Record<string, { rate: number; change: number }>);
        
        // Добавляем RUB для полноты
        result['RUB'] = { rate: 1, change: 0 };
        
        return result;
      } catch (apiError) {
        console.error('Ошибка при запросе к API курсов валют:', apiError);
        // Возвращаем тестовые данные при ошибке API
        return {
          USD: { rate: 91.25, change: 0.5 },
          EUR: { rate: 98.75, change: -0.3 },
          GBP: { rate: 115.50, change: 0.2 },
          CNY: { rate: 12.65, change: 0.1 },
          JPY: { rate: 0.61, change: -0.2 },
          RUB: { rate: 1, change: 0 }
        };
      }
    } catch (error) {
      console.error('Ошибка при получении курсов валют:', error);
      // Всегда возвращаем тестовые данные при любой ошибке
      return {
        USD: { rate: 91.25, change: 0.5 },
        EUR: { rate: 98.75, change: -0.3 },
        GBP: { rate: 115.50, change: 0.2 },
        CNY: { rate: 12.65, change: 0.1 },
        JPY: { rate: 0.61, change: -0.2 },
        RUB: { rate: 1, change: 0 }
      };
    }
  }

  async getCommunityStats(userId: number): Promise<CommunityStats> {
    try {
      // Подсчитываем общее количество участников во всех сообществах
      const totalMembers = await this.communityMemberRepository.count();

      // Подсчитываем активные обсуждения (посты, созданные за последние 7 дней)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeDiscussions = await this.communityPostRepository
        .createQueryBuilder('post')
        .where('post.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .getCount();

      // Подсчитываем публикации текущего пользователя
      const yourContributions = await this.communityPostRepository.count({
        where: { authorId: userId }
      });

      // Получаем последние посты (за последние 7 дней)
      const recentPosts = await this.communityPostRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .leftJoinAndSelect('post.community', 'community')
        .where('post.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .orderBy('post.createdAt', 'DESC')
        .take(10)
        .getMany();

      // Получаем последние лайки (за последние 7 дней)
      const recentLikes = await this.communityPostReactionRepository
        .createQueryBuilder('reaction')
        .leftJoinAndSelect('reaction.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('reaction.post', 'post')
        .leftJoinAndSelect('post.community', 'community')
        .where('reaction.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .orderBy('reaction.createdAt', 'DESC')
        .take(10)
        .getMany();

      // Формируем список активности
      const activities: CommunityActivity[] = [];

      // Добавляем посты
      for (const post of recentPosts) {
        const author = post.author;
        const userName = author 
          ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email 
          : 'Неизвестный пользователь';
        const userAvatar = author?.profile?.avatar || undefined;
        
        activities.push({
          id: post.id,
          type: 'post',
          userId: post.authorId,
          userName,
          userAvatar,
          communityId: post.communityId,
          communityName: post.community?.name || 'Неизвестное сообщество',
          postId: post.id,
          postContent: post.content?.substring(0, 100) || '',
          timestamp: post.createdAt
        });
      }

      // Добавляем лайки
      for (const reaction of recentLikes) {
        const user = reaction.user;
        const userName = user 
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email 
          : 'Неизвестный пользователь';
        const userAvatar = user?.profile?.avatar || undefined;
        
        activities.push({
          id: reaction.id,
          type: 'like',
          userId: reaction.userId,
          userName,
          userAvatar,
          communityId: reaction.post?.communityId || 0,
          communityName: reaction.post?.community?.name || 'Неизвестное сообщество',
          postId: reaction.postId,
          postContent: reaction.post?.content?.substring(0, 100) || '',
          timestamp: reaction.createdAt
        });
      }

      // Сортируем по дате (самые новые первыми)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Ограничиваем до 15 последних активностей
      const limitedActivities = activities.slice(0, 15);

      return {
        totalMembers,
        activeDiscussions,
        yourContributions,
        activities: limitedActivities
      };
    } catch (error) {
      console.error('Ошибка при получении статистики сообществ:', error);
      // Возвращаем значения по умолчанию в случае ошибки
      return {
        totalMembers: 0,
        activeDiscussions: 0,
        yourContributions: 0,
        activities: []
      };
    }
  }
} 