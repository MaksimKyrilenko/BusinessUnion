import { Controller, Get, Param, Query } from '@nestjs/common';
import { FinancialAnalyticsService } from './financial-analytics.service';

@Controller('financial-analytics')
export class FinancialAnalyticsController {
  constructor(private readonly financialAnalyticsService: FinancialAnalyticsService) {}

  @Get('currency-pairs')
  async getCurrencyPairs() {
    return this.financialAnalyticsService.getCurrencyPairs();
  }

  @Get('chart-data/:symbol')
  async getChartData(
    @Param('symbol') symbol: string,
    @Query('range') range: string,
    @Query('type') type: string,
  ) {
    return this.financialAnalyticsService.getChartData(symbol, range, type);
  }

  @Get('technical-indicators/:symbol')
  async getTechnicalIndicators(@Param('symbol') symbol: string) {
    return this.financialAnalyticsService.getTechnicalIndicators(symbol);
  }

  @Get('market-summaries')
  async getMarketSummaries() {
    return this.financialAnalyticsService.getMarketSummaries();
  }
} 