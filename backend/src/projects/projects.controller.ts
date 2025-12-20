import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Project } from './project.entity';
import { ProjectTeamRole } from './enums/project-team-role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('startup_founder')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'businessPlan', maxCount: 1 },
    { name: 'presentation', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]))
  create(
    @Body() createProjectDto: CreateProjectDto, 
    @Request() req,
    @UploadedFiles() files: { 
      businessPlan?: Express.Multer.File[],
      presentation?: Express.Multer.File[],
      image?: Express.Multer.File[]
    }
  ) {
    console.log('Создание проекта с файлами:', files);
    return this.projectsService.create(createProjectDto, req.user, files);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    // Проверка валидности ID
    const projectId = Number(id);
    if (isNaN(projectId)) {
      throw new BadRequestException('Недопустимый ID проекта');
    }
    return this.projectsService.getProjectById(projectId);
  }

  @Get('author/me')
  @UseGuards(JwtAuthGuard)
  findMyProjects(@Request() req) {
    try {
      console.log('[findMyProjects] Получение проектов текущего пользователя');
      console.log('[findMyProjects] req.user:', JSON.stringify(req.user, null, 2));
      console.log('[findMyProjects] req.user?.sub:', req.user?.sub);
      console.log('[findMyProjects] typeof req.user?.sub:', typeof req.user?.sub);
      
      if (!req || !req.user) {
        console.error('[findMyProjects] req или req.user не определен');
        throw new BadRequestException('Пользователь не аутентифицирован');
      }
      
      if (req.user.sub === undefined || req.user.sub === null) {
        console.error('[findMyProjects] req.user.sub не определен:', req.user.sub);
        throw new BadRequestException('ID пользователя не найден в токене');
      }
      
      // Преобразуем в число
      let userId: number;
      if (typeof req.user.sub === 'string') {
        userId = parseInt(req.user.sub, 10);
      } else if (typeof req.user.sub === 'number') {
        userId = req.user.sub;
      } else {
        console.error('[findMyProjects] Неподдерживаемый тип req.user.sub:', typeof req.user.sub, req.user.sub);
        throw new BadRequestException(`Некорректный тип ID пользователя: ${typeof req.user.sub}`);
      }
      
      if (isNaN(userId) || userId <= 0) {
        console.error('[findMyProjects] Некорректный ID пользователя после преобразования:', userId, 'исходное значение:', req.user.sub);
        throw new BadRequestException(`Некорректный ID пользователя: ${req.user.sub}`);
      }
      
      console.log('[findMyProjects] Преобразованный userId:', userId);
      return this.projectsService.findByAuthor(userId);
    } catch (error) {
      console.error('[findMyProjects] Ошибка:', error);
      throw error;
    }
  }

  @Get('author/:id')
  @UseGuards(JwtAuthGuard)
  findByAuthor(@Param('id') id: string) {
    return this.projectsService.findByAuthor(+id);
  }

  @Get('team/me')
  @UseGuards(JwtAuthGuard)
  findProjectsWhereIAmMember(@Request() req) {
    console.log('Получение проектов, где пользователь является участником команды:', req.user);
    if (!req.user || !req.user.sub) {
      throw new BadRequestException('Пользователь не аутентифицирован');
    }
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    if (isNaN(userId)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }
    console.log('Преобразованный userId:', userId);
    return this.projectsService.findByTeamMember(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('startup_founder')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'businessPlan', maxCount: 1 },
    { name: 'presentation', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]))
  update(
    @Param('id') id: string, 
    @Body() updateProjectDto: Partial<Project>,
    @UploadedFiles() files: { 
      businessPlan?: Express.Multer.File[],
      presentation?: Express.Multer.File[],
      image?: Express.Multer.File[]
    }
  ) {
    return this.projectsService.update(+id, updateProjectDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('startup_founder')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  @Post(':id/files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'businessPlan', maxCount: 1 },
    { name: 'presentation', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]))
  async uploadFiles(
    @Param('id') id: string,
    @UploadedFiles() files: { 
      businessPlan?: Express.Multer.File[],
      presentation?: Express.Multer.File[],
      image?: Express.Multer.File[]
    },
    @Request() req
  ) {
    const userId = req.user.id;
    return this.projectsService.uploadFiles(+id, files, userId);
  }

  // Эндпоинты управления командой проекта

  @Get(':id/team')
  @UseGuards(JwtAuthGuard)
  async getTeamMembers(@Param('id') id: string, @Request() req) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.projectsService.getTeamMembers(+id, userId);
  }

  @Post(':id/team')
  @UseGuards(JwtAuthGuard)
  async addTeamMember(
    @Param('id') id: string,
    @Body() body: { userId: number },
    @Request() req
  ) {
    const currentUserId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.projectsService.addTeamMember(+id, body.userId, currentUserId);
  }

  @Patch(':id/team/:userId/role')
  @UseGuards(JwtAuthGuard)
  async updateTeamMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: { role: ProjectTeamRole },
    @Request() req
  ) {
    const currentUserId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.projectsService.updateTeamMemberRole(+id, +userId, body.role, currentUserId);
  }

  @Delete(':id/team/:userId')
  @UseGuards(JwtAuthGuard)
  async removeTeamMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req
  ) {
    const currentUserId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.projectsService.removeTeamMember(+id, +userId, currentUserId);
  }

  @Get(':id/team/chat')
  @UseGuards(JwtAuthGuard)
  async getTeamChat(@Param('id') id: string, @Request() req) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.projectsService.getTeamChat(+id, userId);
  }

  @Post(':id/analyze')
  @UseGuards(JwtAuthGuard)
  async analyzeStartup(@Param('id') id: string) {
    return this.projectsService.analyzeStartup(+id);
  }
} 