import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Тестовые стартапы
const startups = [
  {
    title: 'EcoDelivery',
    description: 'Экологичная служба доставки на электротранспорте. Мы используем электровелосипеды и электроскутеры для доставки товаров в городской черте, снижая углеродный след и обеспечивая быструю доставку.',
    investmentNeeded: 5000000,
    investmentCollected: 1200000,
    expectedRoi: 25,
    status: 'active',
    stage: 'mvp',
    location: 'Москва',
    categoryId: 1,
    category: { id: 1, name: 'Логистика' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 8 }
  },
  {
    title: 'MedTech AI',
    description: 'Платформа для диагностики заболеваний с использованием искусственного интеллекта. Наши алгоритмы анализируют медицинские снимки и помогают врачам ставить точные диагнозы.',
    investmentNeeded: 15000000,
    investmentCollected: 3500000,
    expectedRoi: 40,
    status: 'active',
    stage: 'growth',
    location: 'Санкт-Петербург',
    categoryId: 2,
    category: { id: 2, name: 'Медицина' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 15 }
  },
  {
    title: 'FarmBot',
    description: 'Автоматизированная система для умного земледелия. Роботы и дроны для мониторинга посевов, автоматического полива и сбора урожая.',
    investmentNeeded: 25000000,
    investmentCollected: 8000000,
    expectedRoi: 35,
    status: 'active',
    stage: 'scaling',
    location: 'Краснодар',
    categoryId: 3,
    category: { id: 3, name: 'Агротех' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 22 }
  },
  {
    title: 'EduPlay',
    description: 'Образовательная платформа с геймификацией для детей 6-14 лет. Интерактивные уроки математики, программирования и естественных наук в игровой форме.',
    investmentNeeded: 8000000,
    investmentCollected: 2000000,
    expectedRoi: 30,
    status: 'active',
    stage: 'mvp',
    location: 'Казань',
    categoryId: 4,
    category: { id: 4, name: 'EdTech' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 10 }
  },
  {
    title: 'CryptoWallet Pro',
    description: 'Безопасный мультивалютный криптокошелёк с встроенной биржей и стейкингом. Поддержка более 100 криптовалют и токенов.',
    investmentNeeded: 12000000,
    investmentCollected: 6000000,
    expectedRoi: 50,
    status: 'active',
    stage: 'growth',
    location: 'Москва',
    categoryId: 5,
    category: { id: 5, name: 'FinTech' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 12 }
  },
  {
    title: 'SmartHome Hub',
    description: 'Универсальный хаб для умного дома, объединяющий устройства разных производителей в единую экосистему с голосовым управлением.',
    investmentNeeded: 10000000,
    investmentCollected: 0,
    expectedRoi: 28,
    status: 'pending',
    stage: 'idea',
    location: 'Новосибирск',
    categoryId: 6,
    category: { id: 6, name: 'IoT' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: false, hasMVP: false, teamSize: 3 }
  },
  {
    title: 'FoodShare',
    description: 'Приложение для обмена излишками еды между ресторанами, магазинами и потребителями. Борьба с пищевыми отходами и помощь нуждающимся.',
    investmentNeeded: 3000000,
    investmentCollected: 1500000,
    expectedRoi: 20,
    status: 'active',
    stage: 'mvp',
    location: 'Екатеринбург',
    categoryId: 7,
    category: { id: 7, name: 'FoodTech' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 6 }
  },
  {
    title: 'VR Training',
    description: 'VR-платформа для корпоративного обучения. Симуляции опасных производств, тренинги по продажам и soft skills в виртуальной реальности.',
    investmentNeeded: 20000000,
    investmentCollected: 5000000,
    expectedRoi: 45,
    status: 'active',
    stage: 'growth',
    location: 'Москва',
    categoryId: 4,
    category: { id: 4, name: 'EdTech' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 18 }
  },
  {
    title: 'GreenEnergy',
    description: 'Разработка и установка солнечных панелей нового поколения с КПД 30%. Энергонезависимость для частных домов и бизнеса.',
    investmentNeeded: 50000000,
    investmentCollected: 15000000,
    expectedRoi: 35,
    status: 'active',
    stage: 'scaling',
    location: 'Сочи',
    categoryId: 8,
    category: { id: 8, name: 'CleanTech' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 35 }
  },
  {
    title: 'PetCare',
    description: 'Онлайн-платформа для владельцев домашних животных: телеветеринария, доставка кормов, услуги грумеров и передержки.',
    investmentNeeded: 7000000,
    investmentCollected: 2500000,
    expectedRoi: 25,
    status: 'active',
    stage: 'mvp',
    location: 'Нижний Новгород',
    categoryId: 9,
    category: { id: 9, name: 'PetTech' },
    additionalInfo: { hasBusinessPlan: true, hasTeam: true, hasMVP: true, teamSize: 9 }
  }
];

// Тестовые сообщества
const communities = [
  {
    name: 'Стартаперы России',
    description: 'Сообщество для основателей стартапов. Обмен опытом, поиск партнёров и инвесторов, обсуждение трендов.',
    categoryId: 1,
    isPrivate: false
  },
  {
    name: 'IT-предприниматели',
    description: 'Клуб для владельцев IT-компаний и технологических стартапов. Нетворкинг, менторство, совместные проекты.',
    categoryId: 2,
    isPrivate: false
  },
  {
    name: 'Инвесторы и бизнес-ангелы',
    description: 'Закрытое сообщество для инвесторов. Обсуждение сделок, due diligence, синдикаты.',
    categoryId: 3,
    isPrivate: true
  },
  {
    name: 'Маркетинг для стартапов',
    description: 'Всё о продвижении стартапов: growth hacking, контент-маркетинг, SMM, PR.',
    categoryId: 4,
    isPrivate: false
  },
  {
    name: 'FinTech Club',
    description: 'Сообщество для специалистов в области финансовых технологий. Блокчейн, платежи, необанки.',
    categoryId: 5,
    isPrivate: false
  },
  {
    name: 'Женщины в бизнесе',
    description: 'Поддержка и развитие женского предпринимательства. Менторство, нетворкинг, истории успеха.',
    categoryId: 6,
    isPrivate: false
  },
  {
    name: 'Социальное предпринимательство',
    description: 'Бизнес с социальной миссией. Импакт-инвестиции, устойчивое развитие, ESG.',
    categoryId: 7,
    isPrivate: false
  },
  {
    name: 'Франчайзинг',
    description: 'Всё о франшизах: покупка, продажа, развитие франчайзинговых сетей.',
    categoryId: 8,
    isPrivate: false
  },
  {
    name: 'E-commerce мастера',
    description: 'Сообщество для владельцев интернет-магазинов и маркетплейсов. Wildberries, Ozon, собственные площадки.',
    categoryId: 9,
    isPrivate: false
  },
  {
    name: 'Криптоинвесторы',
    description: 'Обсуждение криптовалют, DeFi, NFT и Web3 проектов. Анализ рынка и инвестиционные стратегии.',
    categoryId: 10,
    isPrivate: false
  }
];

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'businessunion',
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('✅ Подключение к базе данных установлено');

  // Получаем первого пользователя как автора
  const [users] = await dataSource.query('SELECT id FROM user LIMIT 1');
  if (!users) {
    console.error('❌ Нет пользователей в базе. Сначала зарегистрируйте хотя бы одного пользователя.');
    await dataSource.destroy();
    return;
  }
  const authorId = users.id;
  console.log(`📝 Используем пользователя ID: ${authorId} как автора`);

  // Создаём стартапы
  console.log('\n🚀 Создание стартапов...');
  for (const startup of startups) {
    try {
      await dataSource.query(`
        INSERT INTO project (title, description, investmentNeeded, investmentCollected, expectedRoi, status, stage, location, categoryId, category, additionalInfo, authorId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        startup.title,
        startup.description,
        startup.investmentNeeded,
        startup.investmentCollected,
        startup.expectedRoi,
        startup.status,
        startup.stage,
        startup.location,
        startup.categoryId,
        JSON.stringify(startup.category),
        JSON.stringify(startup.additionalInfo),
        authorId
      ]);
      console.log(`  ✓ ${startup.title}`);
    } catch (error) {
      console.log(`  ✗ ${startup.title}: ${error.message}`);
    }
  }

  // Создаём сообщества
  console.log('\n👥 Создание сообществ...');
  for (const community of communities) {
    try {
      await dataSource.query(`
        INSERT INTO community (name, description, categoryId, isPrivate, creatorId)
        VALUES (?, ?, ?, ?, ?)
      `, [
        community.name,
        community.description,
        community.categoryId,
        community.isPrivate,
        authorId
      ]);
      console.log(`  ✓ ${community.name}`);
    } catch (error) {
      console.log(`  ✗ ${community.name}: ${error.message}`);
    }
  }

  await dataSource.destroy();
  console.log('\n✅ Заполнение базы данных завершено!');
}

seed().catch(console.error);
