import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { MarketAnalyticsService } from './market-analytics.service';
import { BusinessAnalyticsService } from './business-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('market-analytics')
@UseGuards(JwtAuthGuard)
export class MarketAnalyticsController {
  constructor(
    private readonly marketAnalyticsService: MarketAnalyticsService,
    private readonly businessAnalyticsService: BusinessAnalyticsService
  ) {}

  @Get('summary')
  async getMarketSummary() {
    return this.marketAnalyticsService.getMarketSummary();
  }

  @Get('crypto')
  async getCryptoMarketData() {
    return this.marketAnalyticsService.getCryptoMarketData();
  }

  @Get('stocks')
  async getStockMarketData() {
    return this.marketAnalyticsService.getStockMarketData();
  }

  @Get('news')
  async getMarketNews() {
    return this.marketAnalyticsService.getMarketNews();
  }

} 