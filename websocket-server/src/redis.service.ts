import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private subscriber: Redis;
  private publisher: Redis;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  async onModuleInit() {
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');

    this.logger.log(`=== Connecting to Redis ===`);
    this.logger.log(`Host: ${redisHost}:${redisPort}`);

    this.subscriber = new Redis({
      host: redisHost,
      port: redisPort,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis reconnecting... attempt ${times}`);
        return delay;
      },
    });

    this.publisher = new Redis({
      host: redisHost,
      port: redisPort,
    });

    this.subscriber.on('connect', () => {
      this.logger.log('Redis subscriber connected');
    });

    this.subscriber.on('error', (err) => {
      this.logger.error('Redis subscriber error:', err.message);
    });

    this.publisher.on('connect', () => {
      this.logger.log('Redis publisher connected');
    });

    // Подписываемся на канал сообщений от backend
    await this.subscriber.subscribe('websocket:events');
    this.logger.log('Subscribed to websocket:events channel');

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'websocket:events') {
        try {
          const data = JSON.parse(message);
          this.logger.log(`[REDIS] Received event: ${data.event}`);
          this.logger.log(`[REDIS] Data: ${JSON.stringify(data).substring(0, 200)}...`);
          
          const handler = this.messageHandlers.get(data.event);
          if (handler) {
            handler(data);
          } else {
            this.logger.warn(`[REDIS] No handler for event: ${data.event}`);
          }
        } catch (error) {
          this.logger.error('Error parsing Redis message:', error.message);
        }
      }
    });
  }

  async onModuleDestroy() {
    await this.subscriber?.quit();
    await this.publisher?.quit();
  }

  onMessage(event: string, handler: (data: any) => void) {
    this.messageHandlers.set(event, handler);
    this.logger.log(`Registered handler for event: ${event}`);
  }

  async publish(event: string, data: any) {
    const message = JSON.stringify({ event, ...data });
    await this.publisher.publish('websocket:events', message);
    this.logger.log(`[REDIS] Published event: ${event}`);
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.publisher.ping();
      return true;
    } catch {
      return false;
    }
  }
}
