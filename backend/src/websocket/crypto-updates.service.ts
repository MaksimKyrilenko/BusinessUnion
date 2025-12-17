import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebsocketGateway } from './websocket.gateway';
import { CryptoTrackerService } from '../crypto-tracker/crypto-tracker.service';

@Injectable()
export class CryptoUpdatesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CryptoUpdatesService.name);
  private isRunning = false;

  constructor(
    private readonly websocketGateway: WebsocketGateway,
    private readonly cryptoTrackerService: CryptoTrackerService,
  ) {}

  onModuleInit() {
    this.logger.log('CryptoUpdatesService initialized');
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  // Обновление цен криптовалют каждые 30 секунд
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateCryptoPrices() {
    if (this.isRunning) return;
    
    try {
      this.isRunning = true;
      
      const topCoins = await this.cryptoTrackerService.getTopCoins(20);
      
      if (topCoins && topCoins.length > 0) {
        this.websocketGateway.sendCryptoUpdate({
          type: 'prices',
          data: topCoins,
          timestamp: new Date().toISOString(),
        });
        
        this.logger.debug(`Sent crypto prices update: ${topCoins.length} coins`);
      }
    } catch (error) {
      this.logger.error('Error updating crypto prices:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // Обновление индекса страха и жадности каждые 5 минут
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateFearGreedIndex() {
    try {
      const fearGreed = await this.cryptoTrackerService.getFearGreedIndex();
      
      this.websocketGateway.sendCryptoUpdate({
        type: 'fearGreed',
        data: fearGreed,
        timestamp: new Date().toISOString(),
      });
      
      this.logger.debug('Sent fear & greed index update');
    } catch (error) {
      this.logger.error('Error updating fear & greed index:', error.message);
    }
  }

  // Обновление BTC доминирования каждые 2 минуты
  @Cron(CronExpression.EVERY_MINUTE)
  async updateBTCDominance() {
    try {
      const dominance = await this.cryptoTrackerService.getBTCDominance();
      
      this.websocketGateway.sendCryptoUpdate({
        type: 'btcDominance',
        data: dominance,
        timestamp: new Date().toISOString(),
      });
      
      this.logger.debug('Sent BTC dominance update');
    } catch (error) {
      this.logger.error('Error updating BTC dominance:', error.message);
    }
  }

  // Проверка аномалий каждую минуту
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAnomalies() {
    try {
      const anomalies = await this.cryptoTrackerService.getAnomalies(5);
      
      if (anomalies && anomalies.length > 0) {
        this.websocketGateway.sendCryptoUpdate({
          type: 'anomalies',
          data: anomalies,
          timestamp: new Date().toISOString(),
        });
        
        this.logger.debug(`Sent ${anomalies.length} anomaly alerts`);
      }
    } catch (error) {
      this.logger.error('Error checking anomalies:', error.message);
    }
  }
}
