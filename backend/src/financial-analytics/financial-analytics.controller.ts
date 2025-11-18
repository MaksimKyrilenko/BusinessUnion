import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinancialAnalyticsService } from './financial-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('financial-analytics')
@UseGuards(JwtAuthGuard)
export class FinancialAnalyticsController {
  constructor(private readonly financialAnalyticsService: FinancialAnalyticsService) {}

  @Get('currency-pairs')
  async getCurrencyPairs() {
    return this.financialAnalyticsService.getCurrencyPairs();
  }

  @Get('chart-data/:symbol')
  async getChartData(
    @Query('range') range: string,
    @Query('type') type: string,
    @Query('symbol') symbol: string
  ) {
    return this.financialAnalyticsService.getChartData(symbol, range, type);
  }

  @Get('technical-indicators/:symbol')
  async getTechnicalIndicators(@Query('symbol') symbol: string) {
    return this.financialAnalyticsService.getTechnicalIndicators(symbol);
  }

  @Get('market-summaries')
  async getMarketSummaries() {
    return this.financialAnalyticsService.getMarketSummaries();
  }
} 