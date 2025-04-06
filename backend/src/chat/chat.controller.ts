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
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async findAll(@Request() req): Promise<Chat[]> {
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

    return this.chatService.findAll(userIdNum);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Chat> {
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

    return this.chatService.findOne(id, userIdNum);
  }

  @Post()
  async create(
    @Body() createChatDto: CreateChatDto,
    @Request() req,
  ): Promise<Chat> {
    // Получаем ID пользователя из JWT токена из поля sub
    const userId = req.user.sub;

    console.log('Создание чата от пользователя:', {
      userId: userId,
      userInfo: req.user,
      chatData: createChatDto
    });

    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число для безопасности
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    // Вызываем сервис с корректным ID пользователя
    return this.chatService.create(createChatDto, userIdNum);
  }

  @Post('personal/:recipientId')
  async createPersonalChat(
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @Request() req,
  ): Promise<Chat> {
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

    return this.chatService.createPersonalChat(userIdNum, recipientId);
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

    return this.chatService.markAsRead(id, userIdNum);
  }

  @Post(':id/unread')
  async markAsUnread(
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

    return this.chatService.markAsUnread(id, userIdNum);
  }

  @Post(':id/pin')
  async togglePin(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isPinned: boolean },
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

    return this.chatService.togglePin(id, userIdNum, body.isPinned);
  }

  @Post(':id/mute')
  async toggleMute(
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

    return this.chatService.toggleMute(id, userIdNum);
  }

  @Post(':id/leave')
  async leaveChat(
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

    return this.chatService.leaveChat(id, userIdNum);
  }

  @Post(':id/typing')
  async setTypingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isTyping: boolean },
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

    // В реальном проекте здесь должна быть логика уведомления других пользователей
    // Например, через WebSockets
    return Promise.resolve();
  }

  @Get(':id/members')
  async getMembers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<any[]> {
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

    return this.chatService.getChatMembers(id, userIdNum);
  }
} 