import { Controller, Get, Logger } from '@nestjs/common';

@Controller('api') // Префикс маршрута
export class AppController {
  private readonly logger = new Logger(AppController.name); // Логгер

  @Get('hello') // Эндпоинт /api/hello
  getHello(): string {
    this.logger.log('GET /api/hello request received'); // Лог при получении запроса
    return 'Hello from Nest.js!';
  }
}