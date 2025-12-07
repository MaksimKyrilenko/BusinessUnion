import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: any,
    @Request() req
  ) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.tasksService.create(+projectId, createTaskDto, userId);
  }

  @Get()
  findAll(@Param('projectId') projectId: string, @Request() req) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.tasksService.findAll(+projectId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.tasksService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: any,
    @Request() req
  ) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.tasksService.update(+id, updateTaskDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = typeof req.user.sub === 'string' ? parseInt(req.user.sub) : req.user.sub;
    return this.tasksService.remove(+id, userId);
  }
}

