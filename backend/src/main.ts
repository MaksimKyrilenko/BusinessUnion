import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Настраиваем статическую раздачу файлов из папки uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
  
  // Настраиваем лимиты для body-parser
  app.use(require('body-parser').json({ limit: '10mb' }));
  app.use(require('body-parser').urlencoded({ limit: '10mb', extended: true }));
  
  // Добавляем глобальный префикс /api
  app.setGlobalPrefix('api');
  
  // Включаем CORS с расширенной конфигурацией
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'https://businessunion-web.ru',
    'http://businessunion-web.ru',
    'https://www.businessunion-web.ru',
    'http://www.businessunion-web.ru',
    'http://localhost',
    'http://localhost:8081',
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, мобильные приложения или Postman)
      if (!origin) return callback(null, true);
      
      // Проверяем, есть ли origin в списке разрешенных
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(null, true); // Временно разрешаем все для отладки
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  });

  // Добавляем логирование входящих запросов
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
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

  // Запускаем приложение на порту 3001
  await app.listen(3001);
}
bootstrap();