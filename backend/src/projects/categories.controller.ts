import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProjectCategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class ProjectCategoriesController {
  constructor(private readonly categoriesService: ProjectCategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }
} 