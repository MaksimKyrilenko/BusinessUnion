import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { ProjectCategory } from './categories.entity';
import { ProjectCategoriesService } from './categories.service';
import { ProjectCategoriesController } from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectCategory])],
  controllers: [ProjectsController, ProjectCategoriesController],
  providers: [ProjectsService, ProjectCategoriesService],
  exports: [ProjectsService, ProjectCategoriesService],
})
export class ProjectsModule {} 