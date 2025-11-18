import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  ParseIntPipe, 
  Post, 
  Request,
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('chat/:chatId')
  async findAll(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Request() req,
  ): Promise<Message[]> {
    // Получаем ID пользователя из JWT токена
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    return this.messageService.findAll(chatId, userIdNum);
  }

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ): Promise<Message> {
    // Получаем ID пользователя из JWT токена
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    console.log('Отправка сообщения:', {
      userId: userIdNum,
      chatId: createMessageDto.chatId,
      text: createMessageDto.text && createMessageDto.text.substring(0, 30) + (createMessageDto.text.length > 30 ? '...' : '')
    });

    return this.messageService.create(createMessageDto, userIdNum);
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<void> {
    // Получаем ID пользователя из JWT токена
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    return this.messageService.markAsRead(id, userIdNum);
  }

  @Post('chat/:chatId/read-all')
  async markAllAsRead(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Request() req,
  ): Promise<void> {
    // Получаем ID пользователя из JWT токена
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    return this.messageService.markAllAsRead(chatId, userIdNum);
  }

  @Post(':id/reaction/:reaction')
  async addReaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('reaction') reaction: string,
    @Request() req,
  ): Promise<Message> {
    // Получаем ID пользователя из JWT токена
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    return this.messageService.addReaction(id, userIdNum, reaction);
  }

  @Post(':id/reaction/:reaction/remove')
  async removeReaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('reaction') reaction: string,
    @Request() req,
  ): Promise<Message> {
    // Получаем ID пользователя из JWT токена
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    return this.messageService.removeReaction(id, userIdNum, reaction);
  }
} 