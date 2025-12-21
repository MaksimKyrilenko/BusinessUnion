import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WebSocketServer');
  
  logger.log('=== Starting WebSocket Server ===');
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Port: ${process.env.WS_PORT || 3002}`);
  logger.log(`Redis Host: ${process.env.REDIS_HOST || 'redis'}`);
  logger.log(`CORS Origin: ${process.env.WS_CORS_ORIGIN || '*'}`);
  
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.WS_CORS_ORIGIN || '*',
    credentials: true,
  });
  
  const port = process.env.WS_PORT || 3002;
  await app.listen(port);
  
  logger.log(`=== WebSocket Server running on port ${port} ===`);
}

bootstrap();
