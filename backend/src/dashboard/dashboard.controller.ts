import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@User('role') role: UserRole, @User('id') userId: number) {
    return this.dashboardService.getStats(role, userId);
  }

  @Get('recent-messages')
  async getRecentMessages(@User('id') userId: number) {
    return this.dashboardService.getRecentMessages(userId, 10);
  }

  @Get('message-stats')
  async getMessageStats(@User('id') userId: number) {
    return this.dashboardService.getMessageStats(userId);
  }

  @Get('activities')
  async getActivities(@User('id') userId: number) {
    return this.dashboardService.getActivities(userId);
  }

  // Специфичные эндпоинты для стартапера
  @Get('startup/info')
  async getStartupInfo(@User('id') userId: number) {
    return this.dashboardService.getStartupInfo(userId);
  }

  @Get('startup/milestones')
  async getStartupMilestones(@User('id') userId: number) {
    return this.dashboardService.getStartupMilestones(userId);
  }

  @Get('startup/metrics')
  async getStartupMetrics(@User('id') userId: number) {
    return this.dashboardService.getStartupMetrics(userId);
  }

  @Get('startup/updates')
  async getStartupUpdates(@User('id') userId: number) {
    return this.dashboardService.getStartupUpdates(userId);
  }

  @Get('startup/mentors')
  async getStartupMentors(@User('id') userId: number) {
    return this.dashboardService.getStartupMentors(userId);
  }

  // Специфичные эндпоинты для инвестора
  @Get('investor/stats')
  async getInvestorStats(@User('id') userId: number) {
    return this.dashboardService.getInvestorStats(userId);
  }

  @Get('investor/pending-projects')
  async getPendingProjects(@User('id') userId: number) {
    return this.dashboardService.getPendingProjects(userId);
  }

  @Get('investor/transactions')
  async getInvestorTransactions(@User('id') userId: number) {
    return this.dashboardService.getInvestorTransactions(userId);
  }

  // Специфичные эндпоинты для крипто-трейдера
  @Get('crypto/stats')
  async getCryptoStats(@User('id') userId: number) {
    return this.dashboardService.getCryptoStats(userId);
  }

  @Get('crypto/positions')
  async getCryptoPositions(@User('id') userId: number) {
    return this.dashboardService.getCryptoPositions(userId);
  }

  @Get('crypto/transactions')
  async getCryptoTransactions(@User('id') userId: number) {
    return this.dashboardService.getCryptoTransactions(userId);
  }

  @Get('crypto/market')
  async getCryptoMarket() {
    return this.dashboardService.getCryptoMarket();
  }

  @Get('news')
  async getNews() {
    return this.dashboardService.getNews(5);
  }

  @Get('events')
  async getEvents() {
    return this.dashboardService.getEvents(5);
  }

  @Get('exchange-rates')
  async getExchangeRates() {
    return this.dashboardService.getExchangeRates();
  }

  @Get('recommended-courses')
  async getRecommendedCourses() {
    return this.dashboardService.getRecommendedCourses(6);
  }

  @Get('market-trends')
  async getMarketTrends() {
    return this.dashboardService.getMarketTrends(5);
  }

  @Get('community-stats')
  async getCommunityStats(@User('id') userId: number) {
    return this.dashboardService.getCommunityStats(userId);
  }
} 