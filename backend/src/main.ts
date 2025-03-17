import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Включаем валидацию
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Настраиваем CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:8081'], // Разрешаем оба порта
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Добавляем глобальный префикс /api
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();