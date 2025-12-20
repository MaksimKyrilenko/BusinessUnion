import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserType } from '../users/enums/user-type.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ==================== USERS ====================

  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('userType') userType?: UserType,
  ) {
    return this.adminService.getUsers(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search,
      userType,
    );
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any,
  ) {
    return this.adminService.updateUser(id, updateData);
  }

  @Patch('users/:id/role')
  async setUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('userType') userType: UserType,
  ) {
    return this.adminService.setUserRole(id, userType);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // ==================== PROJECTS ====================

  @Get('projects')
  async getProjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getProjects(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search,
      status,
    );
  }

  @Get('projects/:id')
  async getProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getProjectById(id);
  }

  @Patch('projects/:id')
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any,
  ) {
    return this.adminService.updateProject(id, updateData);
  }

  @Patch('projects/:id/status')
  async updateProjectStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'pending' | 'active' | 'completed' | 'cancelled',
  ) {
    return this.adminService.updateProjectStatus(id, status);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProject(id);
  }

  // ==================== INVESTMENTS ====================

  @Get('investments')
  async getInvestments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getInvestments(
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  @Get('investments/:id')
  async getInvestmentById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getInvestmentById(id);
  }

  // ==================== COMMUNITIES ====================

  @Get('communities')
  async getCommunities(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getCommunities(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search,
    );
  }

  @Get('communities/:id')
  async getCommunityById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCommunityById(id);
  }

  @Delete('communities/:id')
  async deleteCommunity(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCommunity(id);
  }

  // ==================== ANALYTICS ====================

  @Get('analytics/registrations')
  async getRegistrationStats(@Query('days') days?: string) {
    return this.adminService.getRegistrationStats(parseInt(days) || 30);
  }

  @Get('analytics/projects')
  async getProjectStats(@Query('days') days?: string) {
    return this.adminService.getProjectStats(parseInt(days) || 30);
  }

  @Get('analytics/investments')
  async getInvestmentStats(@Query('days') days?: string) {
    return this.adminService.getInvestmentStats(parseInt(days) || 30);
  }
}
