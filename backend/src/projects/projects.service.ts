import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: any, files?: any): Promise<Project> {
    console.log('Создание проекта:', createProjectDto);
    console.log('Пользователь:', user);
    
    // Преобразуем ID пользователя в число
    const userId = typeof user.sub === 'string' ? parseInt(user.sub) : user.sub;
    
    // Обработка загруженных файлов, если они есть
    let businessPlanUrl: string | undefined;
    let presentationUrl: string | undefined;
    let imageUrl: string | undefined;
    
    if (files) {
      console.log('Загруженные файлы:', files);
      
      // Создаем папку для хранения файлов, если она еще не существует
      const uploadsDir = path.join(process.cwd(), 'uploads', 'projects');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      if (files.businessPlan && files.businessPlan.length > 0) {
        const file = files.businessPlan[0];
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        businessPlanUrl = `/uploads/projects/${fileName}`;
      }
      
      if (files.presentation && files.presentation.length > 0) {
        const file = files.presentation[0];
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        presentationUrl = `/uploads/projects/${fileName}`;
      }
      
      if (files.image && files.image.length > 0) {
        const file = files.image[0];
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        imageUrl = `/uploads/projects/${fileName}`;
      }
    }
    
    // Получаем объект User из базы данных
    const userRepo = this.projectsRepository.manager.getRepository(User);
    const author = await userRepo.findOne({ where: { id: userId } });
    
    if (!author) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }
    
    // Создаем объект проекта
    const projectData: any = {
      ...createProjectDto,
      author
    };
    
    // Добавляем URL загруженных файлов, если они есть
    if (businessPlanUrl) projectData.businessPlanUrl = businessPlanUrl;
    if (presentationUrl) projectData.presentationUrl = presentationUrl;
    if (imageUrl) projectData.image = imageUrl;
    
    const project = this.projectsRepository.create(projectData);
    const savedProject = await this.projectsRepository.save(project);
    return savedProject as unknown as Project;
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['author'],
    });
  }

  async getProjectById(id: number): Promise<Project> {
    if (isNaN(id)) {
      throw new Error('Недопустимый ID проекта');
    }
    
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['author']
    });
    
    if (!project) {
      throw new Error('Проект не найден');
    }
    
    return project;
  }

  async findByAuthor(userId: number): Promise<Project[]> {
    console.log(`Поиск проектов для автора с ID: ${userId}`);
    return this.projectsRepository.find({
      where: { author: { id: userId } },
      relations: ['author'],
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: number, updateData: Partial<Project>, files?: any): Promise<Project> {
    const project = await this.getProjectById(id);
    
    // Обработка загруженных файлов, если они есть
    if (files) {
      console.log('Обновление файлов:', files);
      
      // Создаем папку для хранения файлов, если она еще не существует
      const uploadsDir = path.join(process.cwd(), 'uploads', 'projects');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      if (files.businessPlan) {
        // Удаляем старый файл, если он существует
        if (project.businessPlanUrl) {
          const oldFilePath = path.join(process.cwd(), project.businessPlanUrl.substring(1));
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        
        const file = files.businessPlan[0];
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        updateData.businessPlanUrl = `/uploads/projects/${fileName}`;
      }
      
      if (files.presentation) {
        // Удаляем старый файл, если он существует
        if (project.presentationUrl) {
          const oldFilePath = path.join(process.cwd(), project.presentationUrl.substring(1));
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        
        const file = files.presentation[0];
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        updateData.presentationUrl = `/uploads/projects/${fileName}`;
      }
    }
    
    Object.assign(project, updateData);
    return this.projectsRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.getProjectById(id);
    
    // Удаляем файлы проекта, если они существуют
    if (project.businessPlanUrl) {
      const filePath = path.join(process.cwd(), project.businessPlanUrl.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    if (project.presentationUrl) {
      const filePath = path.join(process.cwd(), project.presentationUrl.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Проект с ID ${id} не найден`);
    }
  }

  async uploadFiles(
    id: number,
    files: {
      businessPlan?: Express.Multer.File[];
      presentation?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    userId: number
  ) {
    // Находим проект
    const project = await this.getProjectById(id);

    // Проверяем права доступа
    if (project.author.id !== userId) {
      throw new Error('У вас нет прав для редактирования этого проекта');
    }

    const uploadPath = path.join(process.cwd(), 'uploads', 'projects');
    
    // Создаем директорию, если её нет
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const updates: Partial<Project> = {};

    // Обрабатываем бизнес-план
    if (files.businessPlan && files.businessPlan.length > 0) {
      const file = files.businessPlan[0];
      const fileName = `bp_${id}_${Date.now()}${path.extname(file.originalname)}`;
      const filePath = path.join(uploadPath, fileName);
      
      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
        updates.businessPlanUrl = `/uploads/projects/${fileName}`;
      }
    }

    // Обрабатываем презентацию
    if (files.presentation && files.presentation.length > 0) {
      const file = files.presentation[0];
      const fileName = `pres_${id}_${Date.now()}${path.extname(file.originalname)}`;
      const filePath = path.join(uploadPath, fileName);
      
      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
        updates.presentationUrl = `/uploads/projects/${fileName}`;
      }
    }

    // Обрабатываем изображение
    if (files.image && files.image.length > 0) {
      const file = files.image[0];
      const fileName = `img_${id}_${Date.now()}${path.extname(file.originalname)}`;
      const filePath = path.join(uploadPath, fileName);
      
      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
        updates.image = `/uploads/projects/${fileName}`;
      }
    }

    // Обновляем проект в базе данных
    if (Object.keys(updates).length > 0) {
      await this.projectsRepository.update(id, updates);
      return { success: true, message: 'Файлы успешно загружены', updates };
    }

    return { success: false, message: 'Нет файлов для загрузки' };
  }
} 