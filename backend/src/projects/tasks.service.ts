import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectTask } from './entities/project-task.entity';
import { Project } from './project.entity';
import { TaskStatus } from './enums/task-status.enum';
import { ProjectTeamMember } from './entities/project-team-member.entity';
import { ProjectTeamRole } from './enums/project-team-role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(ProjectTask)
    private tasksRepository: Repository<ProjectTask>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectTeamMember)
    private teamMemberRepository: Repository<ProjectTeamMember>,
  ) {}

  async create(projectId: number, createTaskDto: any, userId: number): Promise<ProjectTask> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['author']
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Проверяем, является ли пользователь участником команды или автором
    const userMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId }
    });

    const isAuthor = project.author.id === userId;
    if (!userMember && !isAuthor) {
      throw new ForbiddenException('У вас нет доступа к этому проекту');
    }

    const task = this.tasksRepository.create({
      projectId,
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || TaskStatus.NOT_STARTED,
      assignedToId: createTaskDto.assignedToId || null,
      createdById: userId,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      priority: createTaskDto.priority || 'medium'
    });

    return this.tasksRepository.save(task);
  }

  async findAll(projectId: number, userId: number): Promise<ProjectTask[]> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['author']
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Проверяем доступ
    const userMember = await this.teamMemberRepository.findOne({
      where: { projectId, userId }
    });

    const isAuthor = project.author.id === userId;
    if (!userMember && !isAuthor) {
      throw new ForbiddenException('У вас нет доступа к этому проекту');
    }

    return this.tasksRepository.find({
      where: { projectId },
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number, userId: number): Promise<ProjectTask> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'project.author', 'assignedTo', 'createdBy']
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    // Проверяем доступ
    const userMember = await this.teamMemberRepository.findOne({
      where: { projectId: task.projectId, userId }
    });

    const isAuthor = task.project.author.id === userId;
    if (!userMember && !isAuthor) {
      throw new ForbiddenException('У вас нет доступа к этой задаче');
    }

    return task;
  }

  async update(id: number, updateTaskDto: any, userId: number): Promise<ProjectTask> {
    const task = await this.findOne(id, userId);

    // Обновляем только предоставленные поля
    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) task.status = updateTaskDto.status as TaskStatus;
    if (updateTaskDto.assignedToId !== undefined) task.assignedToId = updateTaskDto.assignedToId || null;
    if (updateTaskDto.dueDate !== undefined) task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    if (updateTaskDto.priority !== undefined) task.priority = updateTaskDto.priority;

    return this.tasksRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);

    // Проверяем, может ли пользователь удалять задачи (тимлид, админ или создатель)
    const project = await this.projectsRepository.findOne({
      where: { id: task.projectId },
      relations: ['author']
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    const userMember = await this.teamMemberRepository.findOne({
      where: { projectId: task.projectId, userId }
    });

    const isAuthor = project.author.id === userId;
    const isTeamLead = userMember?.role === ProjectTeamRole.TEAM_LEAD;
    const isAdmin = userMember?.role === ProjectTeamRole.ADMIN;
    const isTaskCreator = task.createdById === userId;

    if (!isAuthor && !isTeamLead && !isAdmin && !isTaskCreator) {
      throw new ForbiddenException('У вас нет прав для удаления этой задачи');
    }

    await this.tasksRepository.remove(task);
  }
}

