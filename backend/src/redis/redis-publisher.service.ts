import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPublisherService.name);
  private publisher: Redis;
  private isConnected = false;

  async onModuleInit() {
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');

    this.logger.log(`=== Connecting to Redis ===`);
    this.logger.log(`Host: ${redisHost}:${redisPort}`);

    this.publisher = new Redis({
      host: redisHost,
      port: redisPort,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis reconnecting... attempt ${times}`);
        return delay;
      },
    });

    this.publisher.on('connect', () => {
      this.logger.log('Redis publisher connected');
      this.isConnected = true;
    });

    this.publisher.on('error', (err) => {
      this.logger.error('Redis publisher error:', err.message);
      this.isConnected = false;
    });

    this.publisher.on('close', () => {
      this.logger.warn('Redis connection closed');
      this.isConnected = false;
    });
  }

  async onModuleDestroy() {
    await this.publisher?.quit();
  }

  async publish(event: string, data: any): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`[REDIS] Not connected, cannot publish ${event}`);
      return;
    }

    const message = JSON.stringify({ event, ...data });
    this.logger.log(`[REDIS] Publishing event: ${event}`);
    this.logger.log(`[REDIS] Data: ${message.substring(0, 200)}...`);
    
    try {
      await this.publisher.publish('websocket:events', message);
      this.logger.log(`[REDIS] Event ${event} published successfully`);
    } catch (error) {
      this.logger.error(`[REDIS] Failed to publish ${event}:`, error.message);
    }
  }

  // Удобные методы для отправки событий

  async sendChatMessage(chatId: number, message: any, participantIds?: number[]): Promise<void> {
    await this.publish('chat:newMessage', { chatId, message, participantIds });
  }

  async sendMessageEdited(chatId: number, message: any): Promise<void> {
    await this.publish('chat:messageEdited', { chatId, message });
  }

  async sendMessageDeleted(chatId: number, messageId: number): Promise<void> {
    await this.publish('chat:messageDeleted', { chatId, messageId });
  }

  async sendNotification(userId: number, notification: any): Promise<void> {
    await this.publish('notification', { userId, notification });
  }

  async sendProjectUpdate(projectId: number, update: any): Promise<void> {
    await this.publish('project:update', { projectId, update });
  }

  async sendCommunityUpdate(communityId: number, update: any): Promise<void> {
    await this.publish('community:update', { communityId, update });
  }

  async sendCryptoUpdate(data: any): Promise<void> {
    await this.publish('crypto:update', { data });
  }

  async sendExchangeRatesUpdate(data: any): Promise<void> {
    await this.publish('exchangeRates:update', { data });
  }
}
