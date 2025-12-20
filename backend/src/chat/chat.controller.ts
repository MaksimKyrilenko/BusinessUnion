import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  ParseIntPipe, 
  Post, 
  Request,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Put
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly minioService: MinioService,
  ) {}

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

  @Get('test')
  async testRoute() {
    console.log('Test route called');
    return { message: 'Chat controller test route is working!' };
  }

  @Put('test-put')
  async testPutRoute(@Body() data: any) {
    console.log('Test PUT route called with data:', data);
    return { 
      message: 'Chat controller test PUT route is working!',
      receivedData: data
    };
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Поддерживаются только JPG, JPEG, PNG и WEBP'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    // Upload to MinIO
    const { objectName, url } = await this.minioService.uploadFromMulter(
      this.minioService.BUCKETS.AVATARS,
      file,
    );

    // Save URL to chat
    const avatarUrl = `/api/files/avatar/${objectName}`;
    await this.chatService.updateChatAvatarUrl(id, userIdNum, avatarUrl);
    
    return { avatarUrl, minioUrl: url };
  }

  @Put(':id')
  async updateChat(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { name?: string; description?: string },
    @Request() req,
  ) {
    console.log(`[updateChat] Получен запрос на обновление чата ${id}:`, updateData);
    console.log(`[updateChat] Данные запроса:`, { headers: req.headers, user: req.user });
    
    const userId = req.user.sub;
    if (!userId) {
      console.log('[updateChat] ID пользователя не найден в токене');
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const userIdNum = parseInt(String(userId).trim(), 10);
    if (isNaN(userIdNum)) {
      console.log('[updateChat] Некорректный ID пользователя:', userId);
      throw new BadRequestException('Некорректный ID пользователя');
    }

    console.log(`[updateChat] Вызываем сервис для обновления чата ${id}, пользователь ${userIdNum}`);
    try {
      const result = await this.chatService.updateChat(id, userIdNum, updateData);
      console.log(`[updateChat] Чат успешно обновлен:`, result);
      return result;
    } catch (error) {
      console.error(`[updateChat] Ошибка при обновлении чата:`, error);
      throw error;
    }
  }

  @Post(':id/users/:userId')
  async addUserToChat(
    @Param('id', ParseIntPipe) chatId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Request() req,
  ) {
    console.log(`[addUserToChat] Запрос на добавление пользователя ${targetUserId} в чат ${chatId}`);
    
    const currentUserId = req.user.sub;
    if (!currentUserId) {
      throw new BadRequestException('ID пользователя не найден в токене');
    }

    // Преобразуем ID в число
    const currentUserIdNum = parseInt(String(currentUserId).trim(), 10);
    if (isNaN(currentUserIdNum)) {
      throw new BadRequestException('Некорректный ID текущего пользователя');
    }

    try {
      const result = await this.chatService.addUserToChat(chatId, currentUserIdNum, targetUserId);
      console.log(`[addUserToChat] Пользователь ${targetUserId} успешно добавлен в чат ${chatId}`);
      return result;
    } catch (error) {
      console.error(`[addUserToChat] Ошибка при добавлении пользователя:`, error);
      throw error;
    }
  }
} 