import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Глобальные настройки
  app.setGlobalPrefix('api'); // Добавляем префикс /api
  app.useGlobalPipes(new ValidationPipe());
  
  // Настройка CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();