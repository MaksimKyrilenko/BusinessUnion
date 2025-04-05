import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      author: user,
    });
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['author'],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!project) {
      throw new NotFoundException(`Проект с ID ${id} не найден`);
    }
    return project;
  }

  async findByAuthor(userId: number): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { author: { id: userId } },
      relations: ['author'],
    });
  }

  async update(id: number, updateData: Partial<Project>): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateData);
    return this.projectsRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Проект с ID ${id} не найден`);
    }
  }
} 