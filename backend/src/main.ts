import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Добавляем глобальный префикс /api
  app.setGlobalPrefix('api');
  
  // Включаем CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
  });

  // Используем cookie-parser
  app.use(cookieParser());

  // Включаем глобальную валидацию
  app.useGlobalPipes(new ValidationPipe());

  // Настраиваем Swagger
  const config = new DocumentBuilder()
    .setTitle('BusinessUnion API')
    .setDescription('API документация для платформы BusinessUnion')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Запускаем приложение на порту 3000
  await app.listen(3000);
}
bootstrap();