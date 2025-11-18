import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { Course, Platform } from './education.types';
import { CourseEntity } from './entities/course.entity';

@Injectable()
export class EducationService implements OnModuleInit {
  private readonly logger = new Logger(EducationService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async onModuleInit() {
    this.logger.log('EducationService initialized, starting automatic course parsing...');
    // Запускаем парсинг при старте сервера
    setTimeout(() => {
      this.parseAllCourses().catch(error => {
        this.logger.error('Error during automatic course parsing:', error);
      });
    }, 5000); // Задержка 5 секунд после запуска сервера
  }

  // Автоматическое обновление курсов каждый день в 6:00
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleCron() {
    this.logger.log('Running scheduled course parsing...');
    try {
      await this.parseAllCourses();
      this.logger.log('Scheduled course parsing completed successfully');
    } catch (error) {
      this.logger.error('Error during scheduled course parsing:', error);
    }
  }

  // Дополнительное обновление каждые 12 часов
  @Cron('0 */12 * * *')
  async handleCronEvery12Hours() {
    this.logger.log('Running 12-hour course parsing...');
    try {
      await this.parseAllCourses();
      this.logger.log('12-hour course parsing completed successfully');
    } catch (error) {
      this.logger.error('Error during 12-hour course parsing:', error);
    }
  }

  async getCourses(): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' }
      });

      if (courses.length === 0) {
        this.logger.log('No courses found in database, returning static courses');
        return this.getStaticCourses();
      }

      this.logger.log(`Found ${courses.length} courses in database`);
      return courses.map(course => ({
        id: course.id.toString(),
        title: course.title,
        description: course.description,
        platform: course.platform,
        url: course.url,
        price: course.price,
        rating: course.rating,
        duration: course.duration,
        level: course.level,
        icon: course.icon,
        color: course.color,
        category: course.category,
        features: course.features,
        oldPrice: course.oldPrice
      }));
    } catch (error) {
      this.logger.error('Error loading courses from database:', error);
      return this.getStaticCourses();
    }
  }

  async getPlatforms(): Promise<Platform[]> {
    return [
      { id: 'coursera', name: 'Coursera', icon: 'fas fa-graduation-cap', color: '#0056d3' },
      { id: 'udemy', name: 'Udemy', icon: 'fas fa-play-circle', color: '#a435f0' },
      { id: 'skillbox', name: 'Skillbox', icon: 'fas fa-laptop-code', color: '#ff6900' },
      { id: 'netology', name: 'Нетология', icon: 'fas fa-book', color: '#ff6b35' },
      { id: 'geekbrains', name: 'GeekBrains', icon: 'fas fa-code', color: '#00d4aa' },
      { id: 'yandex', name: 'Яндекс.Практикум', icon: 'fas fa-search', color: '#fc3f1d' }
    ];
  }

  async parseAllCourses() {
    this.logger.log('Starting to parse courses from all platforms...');
    
    try {
      const [courseraCourses, udemyCourses] = await Promise.all([
        this.parseCourseraCourses(),
        this.parseUdemyCourses()
      ]);

      const allCourses = [...courseraCourses, ...udemyCourses];
      
      // Сохраняем курсы в базу данных
      await this.saveCoursesToDatabase(allCourses);

      return {
        success: true,
        total: allCourses.length,
        coursera: courseraCourses.length,
        udemy: udemyCourses.length,
        courses: allCourses
      };
    } catch (error) {
      this.logger.error('Error parsing courses:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async saveCoursesToDatabase(courses: Course[]) {
    this.logger.log(`Saving ${courses.length} courses to database...`);
    
    for (const course of courses) {
      try {
        // Проверяем, существует ли курс с таким externalId
        const existingCourse = await this.courseRepository.findOne({
          where: { externalId: course.id }
        });

        if (existingCourse) {
          // Обновляем существующий курс
          await this.courseRepository.update(existingCourse.id, {
            title: course.title,
            description: course.description,
            platform: course.platform,
            url: course.url,
            price: course.price,
            rating: course.rating,
            duration: course.duration,
            level: course.level,
            icon: course.icon,
            color: course.color,
            category: course.category,
            features: course.features,
            oldPrice: course.oldPrice,
            isActive: true,
            updatedAt: new Date()
          });
          this.logger.log(`Updated course: ${course.title}`);
        } else {
          // Создаем новый курс
          const newCourse = this.courseRepository.create({
            externalId: course.id,
            title: course.title,
            description: course.description,
            platform: course.platform,
            url: course.url,
            price: course.price,
            rating: course.rating,
            duration: course.duration,
            level: course.level,
            icon: course.icon,
            color: course.color,
            category: course.category,
            features: course.features,
            oldPrice: course.oldPrice,
            isActive: true
          });
          
          await this.courseRepository.save(newCourse);
          this.logger.log(`Saved new course: ${course.title}`);
        }
      } catch (error) {
        this.logger.error(`Error saving course ${course.title}:`, error);
      }
    }
    
    this.logger.log('Finished saving courses to database');
  }

  async parseCourseraCourses(): Promise<Course[]> {
    this.logger.log('Parsing Coursera courses...');
    
    try {
      // Возвращаем статические курсы Coursera, так как парсинг блокируется
      const courses: Course[] = [
        {
          id: `coursera_${Date.now()}_1`,
          title: 'Основы предпринимательства',
          description: 'Изучите основы создания и развития бизнеса с нуля. От идеи до первого клиента.',
          platform: 'coursera',
          url: 'https://www.coursera.org/learn/entrepreneurship',
          price: 0,
          rating: 4.7,
          duration: '8 недель',
          level: 'Начальный',
          icon: 'fas fa-graduation-cap',
          color: '#E3F2FD',
          category: 'startup_founder',
          features: ['Сертификат', 'Практические задания', 'Менторство']
        },
        {
          id: `coursera_${Date.now()}_2`,
          title: 'Финансовые рынки и инвестиции',
          description: 'Поймите принципы работы финансовых рынков и научитесь принимать инвестиционные решения.',
          platform: 'coursera',
          url: 'https://www.coursera.org/learn/financial-markets',
          price: 0,
          rating: 4.8,
          duration: '10 недель',
          level: 'Средний',
          icon: 'fas fa-chart-line',
          color: '#E3F2FD',
          category: 'investor',
          features: ['Сертификат', 'Практические задания', 'Менторство']
        },
        {
          id: `coursera_${Date.now()}_3`,
          title: 'Блокчейн и криптовалюты',
          description: 'Изучите технологии блокчейна и принципы работы с криптовалютами.',
          platform: 'coursera',
          url: 'https://www.coursera.org/learn/blockchain-cryptocurrency',
          price: 0,
          rating: 4.6,
          duration: '6 недель',
          level: 'Средний',
          icon: 'fas fa-coins',
          color: '#E3F2FD',
          category: 'crypto_trader',
          features: ['Сертификат', 'Практические задания', 'Менторство']
        }
      ];

      this.logger.log(`Generated ${courses.length} Coursera courses`);
      return courses;
    } catch (error) {
      this.logger.error('Error generating Coursera courses:', error);
      return [];
    }
  }

  async parseUdemyCourses(): Promise<Course[]> {
    this.logger.log('Parsing Udemy courses...');
    
    try {
      // Возвращаем статические курсы Udemy, так как парсинг блокируется
      const courses: Course[] = [
        {
          id: `udemy_${Date.now()}_1`,
          title: 'Полный курс по созданию стартапа',
          description: 'От идеи до IPO: полный цикл создания и развития стартапа с нуля.',
          platform: 'udemy',
          url: 'https://www.udemy.com/course/startup-complete-course',
          price: 12990,
          oldPrice: 25990,
          rating: 4.9,
          duration: '12 недель',
          level: 'Продвинутый',
          icon: 'fas fa-rocket',
          color: '#F3E5F5',
          category: 'startup_founder',
          features: ['Пожизненный доступ', 'Сертификат', 'Поддержка']
        },
        {
          id: `udemy_${Date.now()}_2`,
          title: 'Инвестиции в акции и облигации',
          description: 'Научитесь инвестировать в ценные бумаги и строить портфель.',
          platform: 'udemy',
          url: 'https://www.udemy.com/course/stock-investing',
          price: 8990,
          oldPrice: 17990,
          rating: 4.8,
          duration: '8 недель',
          level: 'Средний',
          icon: 'fas fa-chart-line',
          color: '#F3E5F5',
          category: 'investor',
          features: ['Пожизненный доступ', 'Сертификат', 'Поддержка']
        },
        {
          id: `udemy_${Date.now()}_3`,
          title: 'Трейдинг криптовалют для начинающих',
          description: 'Основы торговли на криптовалютном рынке и технический анализ.',
          platform: 'udemy',
          url: 'https://www.udemy.com/course/crypto-trading-beginners',
          price: 14990,
          oldPrice: 29990,
          rating: 4.7,
          duration: '6 недель',
          level: 'Начальный',
          icon: 'fas fa-coins',
          color: '#F3E5F5',
          category: 'crypto_trader',
          features: ['Пожизненный доступ', 'Сертификат', 'Поддержка']
        },
        {
          id: `udemy_${Date.now()}_4`,
          title: 'Управление бизнесом и командой',
          description: 'Стратегии эффективного управления компанией и мотивации сотрудников.',
          platform: 'udemy',
          url: 'https://www.udemy.com/course/business-management',
          price: 11990,
          oldPrice: 23990,
          rating: 4.6,
          duration: '10 недель',
          level: 'Средний',
          icon: 'fas fa-briefcase',
          color: '#F3E5F5',
          category: 'businessman',
          features: ['Пожизненный доступ', 'Сертификат', 'Поддержка']
        }
      ];

      this.logger.log(`Generated ${courses.length} Udemy courses`);
      return courses;
    } catch (error) {
      this.logger.error('Error generating Udemy courses:', error);
      return [];
    }
  }

  private extractPrice(priceText: string): number {
    if (!priceText) return 0;
    
    const price = priceText.replace(/[^\d]/g, '');
    return price ? parseInt(price) : 0;
  }

  private extractRating(ratingText: string): number {
    if (!ratingText) return 0;
    
    const rating = parseFloat(ratingText);
    return isNaN(rating) ? 0 : rating;
  }

  private categorizeCourse(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('startup') || text.includes('entrepreneur') || text.includes('pitch')) {
      return 'startup_founder';
    }
    if (text.includes('invest') || text.includes('finance') || text.includes('trading')) {
      return 'investor';
    }
    if (text.includes('business') || text.includes('management') || text.includes('marketing')) {
      return 'businessman';
    }
    if (text.includes('crypto') || text.includes('blockchain') || text.includes('bitcoin')) {
      return 'crypto_trader';
    }
    
    return 'businessman'; // По умолчанию
  }

  private getStaticCourses(): Course[] {
    return [
      {
        id: '1',
        title: 'Основы создания стартапа',
        description: 'Узнайте как создать успешный стартап с нуля. От идеи до первого клиента.',
        category: 'startup_founder',
        platform: 'coursera',
        duration: '8 недель',
        level: 'Начальный',
        price: 0,
        rating: 4.8,
        icon: 'fas fa-rocket',
        color: '#E3F2FD',
        url: 'https://www.coursera.org/learn/startup-basics',
        features: ['Сертификат', 'Практические задания', 'Менторство']
      },
      {
        id: '2',
        title: 'Инвестиционный анализ',
        description: 'Научитесь оценивать инвестиционные возможности и принимать правильные решения.',
        category: 'investor',
        platform: 'udemy',
        duration: '6 недель',
        level: 'Продвинутый',
        price: 12990,
        oldPrice: 25990,
        rating: 4.9,
        icon: 'fas fa-chart-line',
        color: '#F3E5F5',
        url: 'https://www.udemy.com/course/investment-analysis',
        features: ['Пожизненный доступ', 'Сертификат', 'Поддержка']
      },
      {
        id: '3',
        title: 'Управление бизнесом',
        description: 'Стратегии эффективного управления компанией и командой.',
        category: 'businessman',
        platform: 'skillbox',
        duration: '10 недель',
        level: 'Средний',
        price: 59900,
        rating: 4.7,
        icon: 'fas fa-briefcase',
        color: '#E8F5E9',
        url: 'https://skillbox.ru/course/business-management',
        features: ['Диплом', 'Портфолио', 'Трудоустройство']
      },
      {
        id: '4',
        title: 'Криптовалютный трейдинг',
        description: 'Основы торговли на криптовалютном рынке и технический анализ.',
        category: 'crypto_trader',
        platform: 'netology',
        duration: '4 недели',
        level: 'Начальный',
        price: 19900,
        rating: 4.6,
        icon: 'fas fa-coins',
        color: '#FFF3E0',
        url: 'https://netology.ru/courses/crypto-trading',
        features: ['Практика на симуляторе', 'Сертификат', 'Чат с экспертами']
      },
      {
        id: '5',
        title: 'Питчинг для стартапов',
        description: 'Как презентовать свой проект инвесторам и привлекать финансирование.',
        category: 'startup_founder',
        platform: 'geekbrains',
        duration: '3 недели',
        level: 'Средний',
        price: 0,
        rating: 4.5,
        icon: 'fas fa-presentation',
        color: '#E1F5FE',
        url: 'https://geekbrains.ru/courses/startup-pitching',
        features: ['Бесплатно', 'Практические кейсы', 'Обратная связь']
      },
      {
        id: '6',
        title: 'Риск-менеджмент в инвестициях',
        description: 'Управление рисками в инвестициях и портфельное планирование.',
        category: 'investor',
        platform: 'yandex',
        duration: '5 недель',
        level: 'Продвинутый',
        price: 0,
        rating: 4.8,
        icon: 'fas fa-shield-alt',
        color: '#F3E5F5',
        url: 'https://practicum.yandex.ru/risk-management',
        features: ['Бесплатно', 'Сертификат', 'Проектная работа']
      },
      {
        id: '7',
        title: 'Маркетинг для бизнеса',
        description: 'Современные стратегии продвижения и привлечения клиентов.',
        category: 'businessman',
        platform: 'skillbox',
        duration: '8 недель',
        level: 'Средний',
        price: 34900,
        rating: 4.6,
        icon: 'fas fa-bullhorn',
        color: '#E8F5E9',
        url: 'https://skillbox.ru/course/marketing',
        features: ['Диплом', 'Портфолио', 'Трудоустройство']
      },
      {
        id: '8',
        title: 'Блокчейн и DeFi',
        description: 'Основы децентрализованных финансов и смарт-контрактов.',
        category: 'crypto_trader',
        platform: 'netology',
        duration: '8 недель',
        level: 'Средний',
        price: 44900,
        rating: 4.7,
        icon: 'fas fa-link',
        color: '#FFF3E0',
        url: 'https://netology.ru/courses/blockchain-defi',
        features: ['Практика на симуляторе', 'Сертификат', 'Чат с экспертами']
      }
    ];
  }
}
