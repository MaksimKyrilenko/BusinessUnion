import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MarketAnalyticsController } from './market-analytics.controller';
import { BusinessAnalyticsController } from './business-analytics.controller';
import { MarketAnalyticsService } from './market-analytics.service';
import { BusinessAnalyticsService } from './business-analytics.service';
import { Project } from '../projects/project.entity';
import { Investment } from '../investments/investment.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Project, Investment, User])
  ],
  controllers: [MarketAnalyticsController, BusinessAnalyticsController],
  providers: [MarketAnalyticsService, BusinessAnalyticsService],
  exports: [MarketAnalyticsService, BusinessAnalyticsService],
})
export class MarketAnalyticsModule {} 