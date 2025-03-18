import { Module } from '@nestjs/common';
import { FinancialAnalyticsController } from './financial-analytics.controller';
import { FinancialAnalyticsService } from './financial-analytics.service';

@Module({
  controllers: [FinancialAnalyticsController],
  providers: [FinancialAnalyticsService],
  exports: [FinancialAnalyticsService]
})
export class FinancialAnalyticsModule {} 