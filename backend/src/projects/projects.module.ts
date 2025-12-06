import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { ProjectCategory } from './categories.entity';
import { ProjectTeamMember } from './entities/project-team-member.entity';
import { ProjectTask } from './entities/project-task.entity';
import { User } from '../users/user.entity';
import { ProjectCategoriesService } from './categories.service';
import { ProjectCategoriesController } from './categories.controller';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectCategory, ProjectTeamMember, ProjectTask, User]),
    ChatModule
  ],
  controllers: [ProjectsController, ProjectCategoriesController, TasksController],
  providers: [ProjectsService, ProjectCategoriesService, TasksService],
  exports: [ProjectsService, ProjectCategoriesService, TasksService],
})
export class ProjectsModule {} 