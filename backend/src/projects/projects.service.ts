import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/user.entity';
import { UserType } from '../users/enums/user-type.enum';
import { ProjectTeamMember } from './entities/project-team-member.entity';
import { ProjectTeamRole } from './enums/project-team-role.enum';
import { ChatService } from '../chat/chat.service';
import { ChatType } from '../chat/enums/chat-type.enum';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import OpenAI from 'openai';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectTeamMember)
    private teamMemberRepository: Repository<ProjectTeamMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private chatService: ChatService,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: any, files?: any): Promise<Project> {
    console.log('Создание проекта:', createProjectDto);
    console.log('Пользователь:', user);
    
    if (!user || !user.sub) {
      throw new BadRequestException('Пользователь не аутентифицирован');
    }
    
    // Преобразуем ID пользователя в число
    const userId = typeof user.sub === 'string' ? parseInt(user.sub) : user.sub;
    
    if (isNaN(userId)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }
    
    console.log('ID пользователя для создания проекта:', userId);
    
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
    
    // Если изображение пришло как base64, сохраняем его напрямую
    // Если пришло как файл, сохраняем URL
    if (createProjectDto.image && createProjectDto.image.startsWith('data:image')) {
      // Это base64 изображение, сохраняем напрямую
      projectData.image = createProjectDto.image;
    } else if (imageUrl) {
      projectData.image = imageUrl;
    }
    
    const project = this.projectsRepository.create(projectData);
    const savedProject = await this.projectsRepository.save(project) as unknown as Project;
    
    // Автоматически добавляем автора как тимлида команды
    try {
      const teamLead = this.teamMemberRepository.create({
        projectId: savedProject.id,
        userId: userId,
        role: ProjectTeamRole.TEAM_LEAD
      });
      await this.teamMemberRepository.save(teamLead);
      console.log(`Создана запись команды для проекта ${savedProject.id}, пользователь ${userId} как тимлид`);
    } catch (error) {
      console.error('Ошибка при создании записи команды:', error);
      // Не прерываем создание проекта, если ошибка при создании команды
      // Проект уже создан, команду можно будет добавить позже
    }
    
    return savedProject;
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectsRepository.find({
      relations: ['author'],
    });
    console.log(`Найдено ${projects.length} проектов`);
    projects.forEach(p => {
      console.log(`Проект ${p.id}: image = ${p.image ? (p.image.startsWith('data:') ? 'base64 (длина: ' + p.image.length + ')' : p.image) : 'null'}`);
    });
    return projects;
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
    console.log(`[findByAuthor] Начало поиска проектов для пользователя ${userId}, тип: ${typeof userId}`);
    
    // Убеждаемся, что userId - число
    let numericUserId: number;
    if (typeof userId === 'string') {
      numericUserId = parseInt(userId, 10);
    } else if (typeof userId === 'number') {
      numericUserId = userId;
    } else {
      console.error(`[findByAuthor] Некорректный тип userId: ${typeof userId}, значение: ${userId}`);
      return [];
    }
    
    if (isNaN(numericUserId) || numericUserId <= 0) {
      console.error(`[findByAuthor] Некорректный ID пользователя: ${userId} (преобразовано в: ${numericUserId})`);
      return [];
    }
    
    console.log(`[findByAuthor] Используем числовой ID: ${numericUserId}`);
    
    // Инициализируем команды для старых проектов (если нужно)
    await this.initializeTeamForOldProjects(numericUserId);
    
    // Находим все проекты, где пользователь является тимлидом
    const teamMemberships = await this.teamMemberRepository.find({
      where: { 
        userId: numericUserId,
        role: ProjectTeamRole.TEAM_LEAD
      },
      relations: ['project', 'project.author']
    });

    console.log(`[findByAuthor] Найдено ${teamMemberships.length} записей участия как тимлид`);

    const projectIds = teamMemberships.map(tm => tm.projectId);
    
    if (projectIds.length === 0) {
      console.log('[findByAuthor] Нет проектов, где пользователь является тимлидом');
      return [];
    }

    console.log(`[findByAuthor] ID проектов, где пользователь является тимлидом: ${projectIds.join(', ')}`);

    // Получаем проекты
    const projects = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.author', 'author')
      .where('project.id IN (:...projectIds)', { projectIds })
      .orderBy('project.createdAt', 'DESC')
      .getMany();
    
    console.log(`[findByAuthor] Найдено ${projects.length} проектов, где пользователь ${numericUserId} является тимлидом`);
    projects.forEach(p => {
      console.log(`[findByAuthor] Проект ${p.id}: ${p.title}`);
    });
    return projects;
  }

  async findByTeamMember(userId: number): Promise<Project[]> {
    console.log(`Поиск проектов, где пользователь ${userId} является участником (member или admin), тип: ${typeof userId}`);
    
    // Убеждаемся, что userId - число
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(numericUserId)) {
      console.error(`Некорректный ID пользователя: ${userId}`);
      return [];
    }
    
    console.log(`Используем числовой ID: ${numericUserId}`);
    
    // Находим все проекты, где пользователь является участником с ролью member или admin (но не team_lead)
    const teamMemberships = await this.teamMemberRepository.find({
      where: { 
        userId: numericUserId,
        role: In([ProjectTeamRole.MEMBER, ProjectTeamRole.ADMIN])
      },
      relations: ['project', 'project.author']
    });

    console.log(`Найдено ${teamMemberships.length} записей участия в командах (member или admin)`);

    const projectIds = teamMemberships.map(tm => tm.projectId);
    
    if (projectIds.length === 0) {
      console.log('Нет проектов, где пользователь является участником (member или admin)');
      return [];
    }

    console.log(`ID проектов, где пользователь является участником: ${projectIds.join(', ')}`);

    // Используем In для поиска по массиву ID
    const projects = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.author', 'author')
      .where('project.id IN (:...projectIds)', { projectIds })
      .orderBy('project.createdAt', 'DESC')
      .getMany();

    console.log(`Найдено ${projects.length} проектов, где пользователь ${numericUserId} является участником (member или admin)`);
    projects.forEach(p => {
      console.log(`Проект ${p.id}: ${p.title}`);
    });
    return projects;
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
    
    // Если изображение пришло как base64, сохраняем его напрямую
    if (updateData.image && updateData.image.startsWith('data:image')) {
      // Это base64 изображение, сохраняем напрямую
      project.image = updateData.image;
      delete updateData.image; // Удаляем из updateData, чтобы не перезаписать
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

  // Методы управления командой проекта

  async getTeamMembers(projectId: number, userId: number) {
    console.log(`[getTeamMembers] Запрос участников проекта ${projectId} от пользователя ${userId}`);
    
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['author']
    });
    
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }
    
    console.log(`[getTeamMembers] Найден проект: ${project.title}, автор ID: ${project.author.id}`);
    
    // Проверяем, является ли пользователь участником команды
    const userMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId }
    });

    const isAuthor = project.author.id === userId;
    console.log(`[getTeamMembers] Пользователь ${userId} является участником: ${!!userMember}, автором: ${isAuthor}`);

    if (!userMember && !isAuthor) {
      throw new ForbiddenException('У вас нет доступа к команде этого проекта');
    }

    // Загружаем всех участников команды
    let members = await this.teamMemberRepository.find({
      where: { projectId },
      relations: ['user', 'user.profile']
    });

    console.log(`[getTeamMembers] Найдено ${members.length} участников в базе данных`);
    
    // Удаляем дубликаты (если есть) - оставляем только последнюю запись для каждого userId
    const uniqueMembers = new Map<number, ProjectTeamMember>();
    for (const member of members) {
      if (!uniqueMembers.has(member.userId)) {
        uniqueMembers.set(member.userId, member);
      } else {
        // Если есть дубликат, берем более новую запись
        const existing = uniqueMembers.get(member.userId);
        if (existing && member.joinedAt > existing.joinedAt) {
          uniqueMembers.set(member.userId, member);
        }
      }
    }
    members = Array.from(uniqueMembers.values());

    console.log(`[getTeamMembers] После удаления дубликатов: ${members.length} участников`);
    members.forEach(m => {
      console.log(`[getTeamMembers] Участник: userId=${m.userId}, role=${m.role}, имя=${m.user.firstName} ${m.user.lastName}`);
    });

    // Убеждаемся, что автор проекта всегда в команде как тимлид
    const authorInTeam = members.find(m => m.user.id === project.author.id);
    if (!authorInTeam) {
      console.log(`[getTeamMembers] Автор проекта (${project.author.id}) не найден в команде, добавляем как тимлида`);
      // Автор автоматически становится тимлидом
      const authorMember = this.teamMemberRepository.create({
        projectId,
        userId: project.author.id,
        role: ProjectTeamRole.TEAM_LEAD
      });
      await this.teamMemberRepository.save(authorMember);
      
      // Загружаем автора с отношениями
      const savedAuthorMember = await this.teamMemberRepository.findOne({
        where: { id: authorMember.id },
        relations: ['user', 'user.profile']
      });
      if (savedAuthorMember) {
        members.push(savedAuthorMember);
        console.log(`[getTeamMembers] Автор добавлен в команду как тимлид`);
      }
    } else {
      // Убеждаемся, что автор имеет роль тимлида
      if (authorInTeam.role !== ProjectTeamRole.TEAM_LEAD) {
        console.log(`[getTeamMembers] Автор проекта имеет роль ${authorInTeam.role}, обновляем на TEAM_LEAD`);
        authorInTeam.role = ProjectTeamRole.TEAM_LEAD;
        await this.teamMemberRepository.save(authorInTeam);
      }
    }

    // Проверяем, что в команде только один тимлид
    const teamLeads = members.filter(m => m.role === ProjectTeamRole.TEAM_LEAD);
    if (teamLeads.length > 1) {
      console.log(`[getTeamMembers] ВНИМАНИЕ: Найдено ${teamLeads.length} тимлидов в проекте ${projectId}. Исправляем...`);
      // Оставляем только первого тимлида (по дате присоединения или ID), остальных понижаем до администраторов
      teamLeads.sort((a, b) => {
        if (a.joinedAt && b.joinedAt) {
          return a.joinedAt.getTime() - b.joinedAt.getTime();
        }
        return a.id - b.id;
      });
      
      // Первый остается тимлидом, остальные понижаем до администраторов
      for (let i = 1; i < teamLeads.length; i++) {
        const oldTeamLead = teamLeads[i];
        console.log(`[getTeamMembers] Понижаем пользователя ${oldTeamLead.userId} с роли TEAM_LEAD до ADMIN`);
        oldTeamLead.role = ProjectTeamRole.ADMIN;
        await this.teamMemberRepository.save(oldTeamLead);
        // Обновляем в массиве members
        const memberIndex = members.findIndex(m => m.id === oldTeamLead.id);
        if (memberIndex !== -1) {
          members[memberIndex].role = ProjectTeamRole.ADMIN;
        }
      }
    }

    // Сортируем: тимлид первым, затем админы, затем участники
    members.sort((a, b) => {
      const roleOrder = { [ProjectTeamRole.TEAM_LEAD]: 0, [ProjectTeamRole.ADMIN]: 1, [ProjectTeamRole.MEMBER]: 2 };
      return roleOrder[a.role] - roleOrder[b.role];
    });

    console.log(`[getTeamMembers] Возвращаем ${members.length} участников команды`);
    const result = members.map(member => ({
      id: member.id,
      userId: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      role: member.role,
      avatar: member.user.profile?.avatar || null,
      joinedAt: member.joinedAt
    }));
    
    console.log(`[getTeamMembers] Результат:`, JSON.stringify(result, null, 2));
    return result;
  }

  // Вспомогательный метод для инициализации команды для старых проектов
  async initializeTeamForOldProjects(userId: number): Promise<void> {
    console.log(`Инициализация команд для проектов пользователя ${userId}`);
    
    // Находим все проекты пользователя, где он автор
    const projects = await this.projectsRepository.find({
      where: { author: { id: userId } },
      relations: ['author']
    });

    for (const project of projects) {
      // Проверяем, есть ли уже запись в команде для автора
      const existingMember = await this.teamMemberRepository.findOne({
        where: { projectId: project.id, userId: project.author.id }
      });

      if (!existingMember) {
        // Создаем запись для автора как тимлида
        const authorMember = this.teamMemberRepository.create({
          projectId: project.id,
          userId: project.author.id,
          role: ProjectTeamRole.TEAM_LEAD
        });
        await this.teamMemberRepository.save(authorMember);
        console.log(`Создана запись команды для проекта ${project.id}, автор ${project.author.id}`);
      }
    }
  }

  async addTeamMember(projectId: number, targetUserId: number, currentUserId: number) {
    const project = await this.getProjectById(projectId);
    
    // Проверяем права текущего пользователя
    const currentMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId: currentUserId }
    });

    const isAuthor = project.author.id === currentUserId;
    const isTeamLead = currentMember?.role === ProjectTeamRole.TEAM_LEAD;
    const isAdmin = currentMember?.role === ProjectTeamRole.ADMIN;

    if (!isAuthor && !isTeamLead && !isAdmin) {
      throw new ForbiddenException('У вас нет прав для добавления участников');
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId: targetUserId }
    });

    if (existingMember) {
      throw new BadRequestException('Пользователь уже является участником команды');
    }

    // Проверяем существование пользователя
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, что пользователь является стартапером
    if (targetUser.userType !== UserType.STARTUP_FOUNDER) {
      throw new BadRequestException('В команду стартапа могут быть добавлены только стартаперы');
    }

    // Создаем участника команды
    const newMember = this.teamMemberRepository.create({
      projectId,
      userId: targetUserId,
      role: ProjectTeamRole.MEMBER
    });

    await this.teamMemberRepository.save(newMember);

    // Если у проекта еще нет командного чата, создаем его
    if (!project.teamChatId) {
      await this.ensureTeamChat(projectId);
    } else {
      // Добавляем пользователя в командный чат
      try {
        await this.chatService.addUserToChat(project.teamChatId, currentUserId, targetUserId);
      } catch (error) {
        console.error('Ошибка при добавлении пользователя в командный чат:', error);
      }
    }

    return this.getTeamMembers(projectId, currentUserId);
  }

  async updateTeamMemberRole(projectId: number, targetUserId: number, newRole: ProjectTeamRole, currentUserId: number) {
    const project = await this.getProjectById(projectId);
    
    // Проверяем права текущего пользователя
    const currentMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId: currentUserId }
    });

    const isAuthor = project.author.id === currentUserId;
    const isTeamLead = currentMember?.role === ProjectTeamRole.TEAM_LEAD;

    if (!isAuthor && !isTeamLead) {
      throw new ForbiddenException('Только тимлид может изменять роли участников');
    }

    // Находим участника, роль которого нужно изменить
    const targetMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId: targetUserId }
    });

    if (!targetMember) {
      throw new NotFoundException('Участник команды не найден');
    }

    console.log(`[updateTeamMemberRole] Изменение роли пользователя ${targetUserId} на ${newRole} в проекте ${projectId}`);
    console.log(`[updateTeamMemberRole] Текущая роль пользователя: ${targetMember.role}`);
    console.log(`[updateTeamMemberRole] Текущий пользователь ${currentUserId}, является тимлидом: ${isTeamLead}, автором: ${isAuthor}`);
    
    const isTargetTeamLead = targetMember.role === ProjectTeamRole.TEAM_LEAD;
    const isNewRoleTeamLead = newRole === ProjectTeamRole.TEAM_LEAD;
    
    // Если назначается новый тимлид
    if (isNewRoleTeamLead) {
      // Проверяем права
      if (!isTeamLead && !isAuthor) {
        throw new ForbiddenException('Только текущий тимлид может назначить нового тимлида');
      }
      
      // Если участник уже тимлид, ничего не делаем
      if (isTargetTeamLead) {
        console.log(`[updateTeamMemberRole] Пользователь ${targetUserId} уже является тимлидом, изменений не требуется`);
        return this.getTeamMembers(projectId, currentUserId);
      }
      
      console.log(`[updateTeamMemberRole] Назначаем нового тимлида ${targetUserId} для проекта ${projectId}`);
      
      // Находим ВСЕХ существующих тимлидов в проекте и понижаем их до администраторов
      const allTeamLeads = await this.teamMemberRepository.find({
        where: { 
          projectId, 
          role: ProjectTeamRole.TEAM_LEAD 
        }
      });
      
      console.log(`[updateTeamMemberRole] Найдено ${allTeamLeads.length} существующих тимлидов`);
      
      // Понижаем всех существующих тимлидов до администраторов
      for (const teamLead of allTeamLeads) {
        // Не меняем роль нового тимлида
        if (teamLead.userId !== targetUserId) {
          console.log(`[updateTeamMemberRole] Понижаем пользователя ${teamLead.userId} с роли TEAM_LEAD до ADMIN`);
          teamLead.role = ProjectTeamRole.ADMIN;
          await this.teamMemberRepository.save(teamLead);
        }
      }
      
      // Назначаем нового тимлида
      targetMember.role = ProjectTeamRole.TEAM_LEAD;
      console.log(`[updateTeamMemberRole] Назначен новый тимлид: ${targetUserId}`);
    } 
    // Если понижаем тимлида до другой роли
    else if (isTargetTeamLead) {
      // Проверяем права
      if (!isTeamLead && !isAuthor) {
        throw new ForbiddenException('Только тимлид может изменять роли участников');
      }
      
      // Проверяем, что не понижаем последнего тимлида
      const allTeamLeads = await this.teamMemberRepository.find({
        where: { 
          projectId, 
          role: ProjectTeamRole.TEAM_LEAD
        }
      });
      const remainingTeamLeads = allTeamLeads.filter(tl => tl.userId !== targetUserId).length;
      
      if (remainingTeamLeads === 0) {
        throw new BadRequestException('Нельзя понизить последнего тимлида команды');
      }
      
      console.log(`[updateTeamMemberRole] Понижаем тимлида ${targetUserId} до роли ${newRole}`);
      targetMember.role = newRole;
    } 
    // Обычное изменение роли (admin или member)
    else {
      // Проверяем права
      if (!isTeamLead && !isAuthor) {
        throw new ForbiddenException('Только тимлид может изменять роли участников');
      }
      
      console.log(`[updateTeamMemberRole] Изменяем роль пользователя ${targetUserId} с ${targetMember.role} на ${newRole}`);
      targetMember.role = newRole;
    }

    await this.teamMemberRepository.save(targetMember);
    console.log(`[updateTeamMemberRole] Роль успешно изменена. Новая роль пользователя ${targetUserId}: ${targetMember.role}`);
    return this.getTeamMembers(projectId, currentUserId);
  }

  async removeTeamMember(projectId: number, targetUserId: number, currentUserId: number) {
    const project = await this.getProjectById(projectId);
    
    // Проверяем права текущего пользователя
    const currentMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId: currentUserId }
    });

    const isAuthor = project.author.id === currentUserId;
    const isTeamLead = currentMember?.role === ProjectTeamRole.TEAM_LEAD;
    const isAdmin = currentMember?.role === ProjectTeamRole.ADMIN;

    if (!isAuthor && !isTeamLead && !isAdmin) {
      throw new ForbiddenException('У вас нет прав для исключения участников');
    }

    // Находим участника, которого нужно исключить
    const targetMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId: targetUserId }
    });

    if (!targetMember) {
      throw new NotFoundException('Участник команды не найден');
    }

    // Проверяем, что не пытаемся исключить тимлида
    if (targetMember.role === ProjectTeamRole.TEAM_LEAD) {
      throw new ForbiddenException('Нельзя исключить тимлида из команды');
    }

    // Администраторы не могут исключать других участников (только тимлид может)
    if (isAdmin && !isTeamLead && !isAuthor) {
      throw new ForbiddenException('Администраторы не могут исключать участников');
    }

    // Удаляем участника из команды
    await this.teamMemberRepository.remove(targetMember);

    // Удаляем пользователя из командного чата, если он существует
    if (project.teamChatId) {
      try {
        await this.chatService.leaveChat(project.teamChatId, targetUserId);
      } catch (error) {
        console.error('Ошибка при удалении пользователя из командного чата:', error);
      }
    }

    return this.getTeamMembers(projectId, currentUserId);
  }

  private async ensureTeamChat(projectId: number) {
    console.log(`[ensureTeamChat] Создание чата для проекта ${projectId}`);
    
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['author']
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Если чат уже существует, возвращаем его
    if (project.teamChatId) {
      console.log(`[ensureTeamChat] Чат уже существует: ${project.teamChatId}`);
      return project.teamChatId;
    }

    // Получаем всех участников команды
    const members = await this.teamMemberRepository.find({
      where: { projectId },
      relations: ['user']
    });

    console.log(`[ensureTeamChat] Найдено ${members.length} участников команды`);

    // Добавляем автора, если его нет в команде
    let authorMember = members.find(m => m.user.id === project.author.id);
    if (!authorMember) {
      console.log(`[ensureTeamChat] Автор проекта (${project.author.id}) не найден в команде, добавляем как тимлида`);
      const newAuthorMember = this.teamMemberRepository.create({
        projectId,
        userId: project.author.id,
        role: ProjectTeamRole.TEAM_LEAD
      });
      await this.teamMemberRepository.save(newAuthorMember);
      // Перезагружаем с relations
      const savedAuthorMember = await this.teamMemberRepository.findOne({
        where: { id: newAuthorMember.id },
        relations: ['user']
      });
      if (savedAuthorMember) {
        authorMember = savedAuthorMember;
        members.push(savedAuthorMember);
      } else {
        throw new Error(`Не удалось создать запись участника команды для автора проекта ${project.author.id}`);
      }
    }

    // Получаем всех уникальных пользователей из команды
    const userIds = [...new Set(members.map(m => m.user.id))];
    const teamLead = members.find(m => m.role === ProjectTeamRole.TEAM_LEAD) || authorMember;

    if (!teamLead) {
      throw new Error(`Не найден тимлид для проекта ${projectId}`);
    }

    console.log(`[ensureTeamChat] Создаем чат с ${userIds.length} участниками: ${userIds.join(', ')}`);
    console.log(`[ensureTeamChat] Создатель чата (тимлид): ${teamLead.user.id}`);

    // Создаем групповой чат для команды
    // Исключаем создателя из списка userIds, так как он добавляется автоматически в chatService.create
    const chat = await this.chatService.create({
      name: `Команда: ${project.title}`,
      description: `Командный чат проекта "${project.title}"`,
      type: ChatType.GROUP,
      userIds: userIds.filter(id => id !== teamLead.user.id) // Исключаем создателя, так как он добавляется автоматически
    }, teamLead.user.id);

    console.log(`[ensureTeamChat] Чат создан с ID: ${chat.id}`);

    // Убеждаемся, что все участники команды добавлены в чат
    // Проверяем и добавляем любых отсутствующих участников
    for (const member of members) {
      if (member.user.id !== teamLead.user.id) {
        try {
          console.log(`[ensureTeamChat] Проверяем наличие участника ${member.user.id} в чате...`);
          // Пытаемся добавить участника (метод вернет сообщение, если уже добавлен)
          await this.chatService.addUserToChat(chat.id, teamLead.user.id, member.user.id);
        } catch (error) {
          // Игнорируем ошибку, если пользователь уже в чате
          if (error.message && error.message.includes('уже является участником')) {
            console.log(`[ensureTeamChat] Участник ${member.user.id} уже в чате`);
          } else {
            console.error(`[ensureTeamChat] Ошибка при добавлении участника ${member.user.id} в чат:`, error);
          }
        }
      }
    }

    // Сохраняем ID чата в проекте
    project.teamChatId = chat.id;
    await this.projectsRepository.save(project);

    console.log(`[ensureTeamChat] Чат ${chat.id} успешно создан и сохранен для проекта ${projectId}`);
    return chat.id;
  }

  async getTeamChat(projectId: number, userId: number) {
    console.log(`[getTeamChat] Запрос чата проекта ${projectId} от пользователя ${userId}`);
    
    const project = await this.getProjectById(projectId);
    
    // Проверяем, является ли пользователь участником команды
    const userMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId }
    });

    const isAuthor = project.author.id === userId;
    console.log(`[getTeamChat] Пользователь ${userId} является участником: ${!!userMember}, автором: ${isAuthor}`);

    if (!userMember && !isAuthor) {
      throw new ForbiddenException('У вас нет доступа к команде этого проекта');
    }

    // Создаем чат, если его еще нет
    if (!project.teamChatId) {
      console.log(`[getTeamChat] Чат для проекта ${projectId} не существует, создаем...`);
      await this.ensureTeamChat(projectId);
      // Обновляем проект
      const updatedProject = await this.getProjectById(projectId);
      console.log(`[getTeamChat] Чат создан с ID: ${updatedProject.teamChatId}`);
      const chat = await this.chatService.findOne(updatedProject.teamChatId, userId);
      console.log(`[getTeamChat] Загружен чат с ${chat.messages?.length || 0} сообщениями`);
      return chat;
    }

    console.log(`[getTeamChat] Загружаем существующий чат ID: ${project.teamChatId}`);
    const chat = await this.chatService.findOne(project.teamChatId, userId);
    console.log(`[getTeamChat] Загружен чат с ${chat.messages?.length || 0} сообщениями`);
    if (chat.messages) {
      chat.messages.forEach(m => {
        console.log(`[getTeamChat] Сообщение ID: ${m.id}, отправитель: ${m.sender?.id || 'unknown'}, текст: ${m.text?.substring(0, 50) || ''}`);
      });
    }
    return chat;
  }

  async analyzeStartup(projectId: number): Promise<string> {
    const project = await this.getProjectById(projectId);
    
    // Получаем конфигурацию Yandex Cloud AI
    const apiKey = process.env.YANDEX_CLOUD_API_KEY;
    const baseUrl = process.env.YANDEX_CLOUD_API_URL || 'https://rest-assistant.api.cloud.yandex.net/v1';
    const yandexProjectId = process.env.YANDEX_CLOUD_PROJECT_ID;
    const agentId = process.env.YANDEX_CLOUD_AGENT_ID;

    if (!apiKey || !agentId) {
      throw new BadRequestException(
        'Сервис анализа стартапов не настроен. Пожалуйста, обратитесь к администратору для настройки Yandex Cloud AI.'
      );
    }

    // Формируем промпт для анализа стартапа
    const analysisPrompt = `Проанализируй следующий стартап и предоставь детальный инвестиционный анализ:

Название: ${project.title}
Описание: ${project.description}
Стадия: ${project.stage}
Категория: ${project.category?.name || 'Не указана'}
Требуемые инвестиции: ${project.investmentNeeded} ₽
Собранные инвестиции: ${project.investmentCollected || 0} ₽
Ожидаемая ROI: ${project.expectedRoi || 0}%
Локация: ${project.location || 'Не указана'}
Статус: ${project.status}

Дополнительная информация:
${project.additionalInfo ? JSON.stringify(project.additionalInfo) : 'Не предоставлена'}

Пожалуйста, предоставь анализ по следующим аспектам:
1. Оценка бизнес-модели и потенциала
2. Анализ рынка и конкурентной среды
3. Оценка команды и стадии развития
4. Финансовые показатели и риски
5. Рекомендации для инвестора

Будь конкретным и объективным в своем анализе.`;

    try {
      // Используем OpenAI SDK для работы с Yandex Cloud AI (OpenAI-совместимый API)
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl,
        defaultQuery: yandexProjectId ? { project: yandexProjectId } : undefined,
      });

      console.log('[analyzeStartup] Отправка запроса к Yandex Cloud API через OpenAI SDK:', {
        baseURL: baseUrl,
        agentId: agentId,
        projectId: yandexProjectId,
      });

      // Используем метод responses.create как в примере пользователя
      const response = await (client as any).responses.create({
        prompt: {
          id: agentId,
        },
        input: analysisPrompt,
      });

      console.log('[analyzeStartup] Ответ от Yandex Cloud API:', {
        response: JSON.stringify(response, null, 2),
      });

      // Извлекаем результат из ответа
      const result = response?.output_text || 
                    response?.outputText || 
                    response?.text ||
                    response?.response ||
                    (typeof response === 'string' ? response : null);

      if (!result) {
        console.error('[analyzeStartup] Не удалось извлечь результат из ответа:', response);
        // Пробуем альтернативный способ через axios
        return await this.analyzeStartupWithAxios(project, apiKey, baseUrl, yandexProjectId, agentId, analysisPrompt);
      }

      return result;
    } catch (error) {
      console.error('[analyzeStartup] Ошибка при анализе стартапа через Yandex Cloud AI:', error);
      console.error('[analyzeStartup] Детали ошибки:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? Object.keys(error.config.headers) : undefined,
        },
      });
      
      // Проверяем, является ли ошибка связанной с истекшим токеном Yandex Cloud
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 
                           errorData?.error?.message ||
                           errorData?.error ||
                           error.message || 
                           'Неизвестная ошибка';
      
      // Проверяем на ошибку истекшего токена
      if (error.response?.status === 401 || 
          (typeof errorMessage === 'string' && errorMessage.includes('UNAUTHENTICATED') && errorMessage.includes('expired'))) {
        throw new BadRequestException(
          'Токен доступа к Yandex Cloud AI истек. Пожалуйста, обратитесь к администратору для обновления токена.'
        );
      }
      
      // Проверяем на ошибку отсутствия токена
      if (error.response?.status === 401 || 
          (typeof errorMessage === 'string' && errorMessage.includes('UNAUTHENTICATED'))) {
        throw new BadRequestException(
          'Ошибка аутентификации в Yandex Cloud AI. Пожалуйста, обратитесь к администратору.'
        );
      }
      
      throw new BadRequestException(`Ошибка при анализе стартапа: ${errorMessage}`);
    }
  }

  // Альтернативный метод через axios (fallback)
  private async analyzeStartupWithAxios(
    project: Project,
    apiKey: string,
    baseUrl: string,
    yandexProjectId: string | undefined,
    agentId: string,
    analysisPrompt: string
  ): Promise<string> {
    try {
      const requestUrl = `${baseUrl}/responses`;
      const requestBody = {
        prompt: {
          id: agentId,
        },
        input: analysisPrompt,
      };

      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };

      const config: any = {
        headers,
      };

      if (yandexProjectId) {
        config.params = { project: yandexProjectId };
      }

      console.log('[analyzeStartupWithAxios] Попытка через axios:', { url: requestUrl });

      const response = await axios.post(requestUrl, requestBody, config);

      const result = response.data?.output_text || 
                    response.data?.outputText || 
                    response.data?.text ||
                    response.data?.response ||
                    (typeof response.data === 'string' ? response.data : null);

      if (!result) {
        throw new Error('Не удалось извлечь результат из ответа');
      }

      return result;
    } catch (error) {
      console.error('[analyzeStartupWithAxios] Ошибка:', error);
      
      // Проверяем на ошибку истекшего токена Yandex Cloud
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 
                           errorData?.error?.message ||
                           errorData?.error ||
                           error.message || 
                           'Неизвестная ошибка';
      
      if (error.response?.status === 401 || 
          (typeof errorMessage === 'string' && errorMessage.includes('UNAUTHENTICATED') && errorMessage.includes('expired'))) {
        throw new BadRequestException(
          'Токен доступа к Yandex Cloud AI истек. Пожалуйста, обратитесь к администратору для обновления токена.'
        );
      }
      
      throw error;
    }
  }
} 