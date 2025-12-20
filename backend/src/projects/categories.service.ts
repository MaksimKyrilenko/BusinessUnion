import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectCategory } from './categories.entity';

@Injectable()
export class ProjectCategoriesService {
  constructor(
    @InjectRepository(ProjectCategory)
    private categoriesRepository: Repository<ProjectCategory>,
  ) {
    // Создаем категории при инициализации, если их нет
    this.seedCategories();
  }

  async findAll(): Promise<ProjectCategory[]> {
    return this.categoriesRepository.find();
  }

  async findOne(id: number): Promise<ProjectCategory | null> {
    return this.categoriesRepository.findOne({ where: { id } });
  }

  async create(name: string, description?: string, icon?: string): Promise<ProjectCategory> {
    const category = this.categoriesRepository.create({
      name,
      description,
      icon,
    });
    return this.categoriesRepository.save(category);
  }

  // Метод для начального заполнения базы данных категориями
  private async seedCategories() {
    const count = await this.categoriesRepository.count();
    
    // Если категорий нет, создаем их
    if (count === 0) {
      const defaultCategories = [
        { name: 'IT и технологии', description: 'Проекты в области информационных технологий', icon: 'computer' },
        { name: 'Финтех', description: 'Финансовые технологии и решения', icon: 'money' },
        { name: 'Медицина и здравоохранение', description: 'Проекты в сфере медицины и здоровья', icon: 'health' },
        { name: 'Образование', description: 'Образовательные проекты и EdTech', icon: 'school' },
        { name: 'Экология', description: 'Проекты, связанные с экологией и устойчивым развитием', icon: 'eco' },
        { name: 'E-commerce', description: 'Проекты в сфере электронной коммерции', icon: 'shopping' },
        { name: 'Транспорт и логистика', description: 'Транспортные и логистические решения', icon: 'truck' },
        { name: 'Питание и FoodTech', description: 'Пищевые технологии и проекты в сфере питания', icon: 'food' },
        { name: 'Недвижимость и PropTech', description: 'Проекты в сфере недвижимости', icon: 'home' },
        { name: 'Развлечения и медиа', description: 'Проекты в сфере развлечений и медиа', icon: 'movie' },
      ];

      for (const category of defaultCategories) {
        await this.create(category.name, category.description, category.icon);
      }
      
      console.log('Категории проектов успешно созданы');
    }
  }
} 