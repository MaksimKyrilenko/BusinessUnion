import { DataSource } from 'typeorm';
import { CommunityCategory } from '../entities/community-category.entity';

export async function seedCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(CommunityCategory);

  const categories = [
    { name: 'Стартапы', icon: 'fas fa-rocket' },
    { name: 'Инвесторы', icon: 'fas fa-chart-line' },
    { name: 'Бизнес', icon: 'fas fa-briefcase' },
    { name: 'Крипто', icon: 'fas fa-coins' },
  ];

  for (const categoryData of categories) {
    const existingCategory = await categoryRepository.findOne({
      where: { name: categoryData.name },
    });

    if (!existingCategory) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
    }
  }
}





















