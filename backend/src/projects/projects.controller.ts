import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Project } from './project.entity';
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

  @Get('author/:id')
  @UseGuards(JwtAuthGuard)
  findByAuthor(@Param('id') id: string) {
    return this.projectsService.findByAuthor(+id);
  }

  @Get('author/me')
  @UseGuards(JwtAuthGuard)
  findMyProjects(@Request() req) {
    console.log('Получение проектов текущего пользователя:', req.user);
    return this.projectsService.findByAuthor(req.user.sub);
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
} 