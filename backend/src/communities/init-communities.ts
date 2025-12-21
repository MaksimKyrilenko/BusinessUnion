import { DataSource } from 'typeorm';
import { CommunityCategory } from './entities/community-category.entity';

export async function initCommunities(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(CommunityCategory);

  // Проверяем, есть ли уже категории
  const existingCategories = await categoryRepository.count();
  
  if (existingCategories === 0) {
    console.log('Инициализация категорий сообществ...');
    
    const categories = [
      { name: 'Стартапы', icon: 'fas fa-rocket' },
      { name: 'Инвесторы', icon: 'fas fa-chart-line' },
      { name: 'Бизнес', icon: 'fas fa-briefcase' },
      { name: 'Крипто', icon: 'fas fa-coins' },
    ];

    for (const categoryData of categories) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`Создана категория: ${categoryData.name}`);
    }
    
    console.log('Категории сообществ успешно инициализированы!');
  } else {
    console.log('Категории сообществ уже существуют');
  }
}





















