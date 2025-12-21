import { DataSource } from 'typeorm';
import { CommunityCategory } from './src/communities/entities/community-category.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function initCategories() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'union_db',
    entities: [CommunityCategory],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    const categoryRepository = dataSource.getRepository(CommunityCategory);

    // Проверяем, есть ли уже категории
    const existingCategories = await categoryRepository.count();
    console.log(`Existing categories: ${existingCategories}`);

    if (existingCategories === 0) {
      console.log('Creating categories...');
      
      const categories = [
        { name: 'Стартапы', icon: 'fas fa-rocket' },
        { name: 'Инвесторы', icon: 'fas fa-chart-line' },
        { name: 'Бизнес', icon: 'fas fa-briefcase' },
        { name: 'Крипто', icon: 'fas fa-coins' },
      ];

      for (const categoryData of categories) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
        console.log(`Created category: ${categoryData.name}`);
      }
      
      console.log('Categories created successfully!');
    } else {
      console.log('Categories already exist');
    }

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

initCategories();





















