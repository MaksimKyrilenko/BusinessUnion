import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketAnalyticsController } from './market-analytics.controller';
import { MarketAnalyticsService } from './market-analytics.service';

@Module({
  imports: [ConfigModule],
  controllers: [MarketAnalyticsController],
  providers: [MarketAnalyticsService],
  exports: [MarketAnalyticsService],
})
export class MarketAnalyticsModule {} 