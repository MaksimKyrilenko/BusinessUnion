import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EducationService } from './education.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get('courses')
  async getCourses() {
    return this.educationService.getCourses();
  }

  @Get('platforms')
  async getPlatforms() {
    return this.educationService.getPlatforms();
  }

  @Post('parse-courses')
  @UseGuards(JwtAuthGuard)
  async parseCourses() {
    return this.educationService.parseAllCourses();
  }

  @Post('parse-coursera')
  @UseGuards(JwtAuthGuard)
  async parseCoursera() {
    return this.educationService.parseCourseraCourses();
  }

  @Post('parse-udemy')
  @UseGuards(JwtAuthGuard)
  async parseUdemy() {
    return this.educationService.parseUdemyCourses();
  }
}
