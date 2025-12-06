import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CryptoTrackerController } from './crypto-tracker.controller';
import { CryptoTrackerService } from './crypto-tracker.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [CryptoTrackerController],
  providers: [CryptoTrackerService],
  exports: [CryptoTrackerService],
})
export class CryptoTrackerModule {}



