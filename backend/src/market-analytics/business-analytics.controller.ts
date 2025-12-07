import { Controller, Get, Query } from '@nestjs/common';
import { BusinessAnalyticsService } from './business-analytics.service';

@Controller('business-analytics')
export class BusinessAnalyticsController {
  constructor(
    private readonly businessAnalyticsService: BusinessAnalyticsService
  ) {}

  @Get('startup-stats')
  async getStartupStatistics() {
    return this.businessAnalyticsService.getStartupStatistics();
  }

  @Get('top-startups')
  async getTopStartups(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.businessAnalyticsService.getTopStartups(limitNum);
  }

  @Get('investment-trends')
  async getInvestmentTrends() {
    return this.businessAnalyticsService.getInvestmentTrends();
  }

  @Get('category-distribution')
  async getCategoryDistribution() {
    return this.businessAnalyticsService.getCategoryDistribution();
  }

  @Get('risk-analysis')
  async getRiskAnalysis() {
    return this.businessAnalyticsService.getRiskAnalysis();
  }

  @Get('market-forecast')
  async getMarketForecast() {
    return this.businessAnalyticsService.getMarketForecast();
  }

  @Get('economic-indicators')
  async getEconomicIndicators() {
    return this.businessAnalyticsService.getEconomicIndicators();
  }

  @Get('industry-trends')
  async getIndustryTrends() {
    return this.businessAnalyticsService.getIndustryTrends();
  }
}
