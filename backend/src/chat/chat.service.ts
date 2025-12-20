import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatUser } from './entities/chat-user.entity';
import { Message } from './entities/message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatType } from './enums/chat-type.enum';
import { ChatUserRole } from './enums/chat-user-role.enum';
import { MessageStatus } from './enums/message-status.enum';
import { User } from '../users/user.entity';
import { Logger } from '@nestjs/common';
import { RedisPublisherService } from '../redis/redis-publisher.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatUser)
    private chatUserRepository: Repository<ChatUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private redisPublisher: RedisPublisherService,
  ) {}

  async findAll(userId: number): Promise<Chat[]> {
    // Найти все чаты, в которых пользователь участвует
    const chatUsers = await this.chatUserRepository.find({
      where: { userId },
      relations: ['chat'],
    });

    // Извлечь ID чатов
    const chatIds = chatUsers.map(cu => cu.chatId);

    // Если у пользователя нет чатов, вернуть пустой массив
    if (chatIds.length === 0) {
      return [];
    }

    // Найти все чаты с участниками (БЕЗ всех сообщений для оптимизации)
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'chatUser')
      .leftJoinAndSelect('chatUser.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .where('chat.id IN (:...chatIds)', { chatIds })
      .getMany();

    // Для каждого чата загружаем только последнее сообщение
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await this.chatRepository
          .createQueryBuilder('chat')
          .leftJoinAndSelect('chat.messages', 'messages')
          .leftJoinAndSelect('messages.sender', 'messageSender')
          .where('chat.id = :chatId', { chatId: chat.id })
          .orderBy('messages.createdAt', 'DESC')
          .getOne()
          .then(c => c?.messages?.[0] || null);

        const participants = chat.users?.map(cu => ({
          id: cu.user?.id,
          firstName: cu.user?.firstName || '',
          lastName: cu.user?.lastName || '',
          email: cu.user?.email || '',
          avatar: cu.user?.profile?.avatar || null,
          role: cu.role
        })) || [];

        // Получаем данные для текущего пользователя (unreadCount, isPinned, isMuted)
        const chatUser = chatUsers.find(cu => cu.chatId === chat.id);
        
        return {
          ...chat,
          participants,
          lastMessage,
          messages: [], // Не возвращаем все сообщения в списке чатов
          unreadCount: chatUser?.unreadCount || 0,
          isPinned: chatUser?.isPinned || false,
          isMuted: chatUser?.isMuted || false
        };
      })
    );

    // Сортируем: сначала закреплённые, потом по времени последнего сообщения
    return chatsWithLastMessage.sort((a, b) => {
      // Сначала закреплённые
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Затем по времени последнего сообщения
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  async findOne(id: number, userId: number): Promise<Chat> {
    // Проверяем, является ли пользователь участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId: id, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат с ID ${id} не найден или вы не имеете доступа`);
    }

    // Возвращаем чат со всеми его сообщениями и пользователями
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'chatUser')
      .leftJoinAndSelect('chatUser.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('chat.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'senderProfile')
      .leftJoinAndSelect('messages.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replyToSender')
      .leftJoinAndSelect('replyToSender.profile', 'replyToSenderProfile')
      .where('chat.id = :id', { id })
      .orderBy('messages.createdAt', 'ASC')
      .getOne();

    if (!chat) {
      throw new NotFoundException(`Чат с ID ${id} не найден`);
    }

    // Добавляем participants для консистентности с findAll
    const participants = chat.users?.map(cu => ({
      id: cu.user?.id,
      firstName: cu.user?.firstName || '',
      lastName: cu.user?.lastName || '',
      email: cu.user?.email || '',
      avatar: cu.user?.profile?.avatar || null,
      role: cu.role
    })) || [];

    return {
      ...chat,
      participants
    } as Chat;
  }

  async create(createChatDto: CreateChatDto, creatorId: number): Promise<Chat> {
    this.logger.log(`Создание чата: ${JSON.stringify(createChatDto)}, создатель ID: ${creatorId}`);
    
    // Проверка аргументов
    if (!createChatDto || !creatorId) {
      this.logger.error('Некорректные параметры для создания чата');
      throw new BadRequestException('Некорректные параметры для создания чата');
    }
    
    // Создаем новый чат
    const chat = this.chatRepository.create({
      name: createChatDto.name,
      description: createChatDto.description,
      avatar: createChatDto.avatar,
      type: createChatDto.type,
    });

    // Сохраняем чат
    const savedChat = await this.chatRepository.save(chat);
    this.logger.log(`Чат создан с ID: ${savedChat.id}`);

    // Добавляем создателя как владельца чата
    await this.chatUserRepository.save({
      userId: creatorId,
      chatId: savedChat.id,
      role: ChatUserRole.OWNER,
    });
    this.logger.log(`Добавлен владелец чата (ID: ${creatorId})`);

    // Проверяем и добавляем других пользователей
    if (Array.isArray(createChatDto.userIds) && createChatDto.userIds.length > 0) {
      // Получаем только валидные числовые ID
      const uniqueUserIds = [...new Set(createChatDto.userIds)]
        .filter(id => {
          // Фильтруем невалидные ID и текущего пользователя
          const isValid = typeof id === 'number' && !isNaN(id) && id !== creatorId;
          if (!isValid) {
            this.logger.warn(`Пропускаем невалидный ID пользователя: ${id}`);
          }
          return isValid;
        });
      
      this.logger.log(`Добавление ${uniqueUserIds.length} пользователей в чат`);

      for (const userId of uniqueUserIds) {
        try {
          const user = await this.userRepository.findOne({ where: { id: userId } });
          if (user) {
            await this.chatUserRepository.save({
              userId,
              chatId: savedChat.id,
              role: ChatUserRole.MEMBER,
            });
            this.logger.log(`Добавлен пользователь ID ${userId} в чат`);
          } else {
            this.logger.warn(`Пользователь с ID ${userId} не найден`);
          }
        } catch (error) {
          this.logger.error(`Ошибка при добавлении пользователя ${userId} в чат: ${error.message}`);
        }
      }
    } else {
      this.logger.log('Нет дополнительных пользователей для добавления в чат');
    }

    // Возвращаем полную информацию о чате
    return this.findOne(savedChat.id, creatorId);
  }

  async createPersonalChat(
    creatorId: number,
    recipientId: number,
  ): Promise<Chat> {
    // Проверяем, существует ли уже личный чат между этими пользователями
    const existingChat = await this.findExistingPersonalChat(creatorId, recipientId);
    if (existingChat) {
      return existingChat;
    }

    // Получаем информацию о пользователях
    const creator = await this.userRepository.findOne({ where: { id: creatorId } });
    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });

    if (!creator || !recipient) {
      throw new NotFoundException('Один или оба пользователя не найдены');
    }

    // Создаем новый личный чат
    const chatName = `${creator.firstName} ${creator.lastName} и ${recipient.firstName} ${recipient.lastName}`;
    
    return this.create(
      {
        name: chatName,
        type: ChatType.PERSONAL,
        userIds: [creatorId, recipientId],
      },
      creatorId,
    );
  }

  private async findExistingPersonalChat(userId1: number, userId2: number): Promise<Chat | null> {
    // Находим личные чаты для обоих пользователей
    const chatsForUser1 = await this.chatUserRepository.find({
      where: { userId: userId1 },
      relations: ['chat'],
    });

    const personalChatIds = chatsForUser1
      .filter(cu => cu.chat.type === ChatType.PERSONAL)
      .map(cu => cu.chatId);

    if (personalChatIds.length === 0) {
      return null;
    }

    // Проверяем, существует ли чат, в котором участвуют оба пользователя
    // Используем In для работы с массивом ID
    const chatUsersForUser2 = await this.chatUserRepository
      .createQueryBuilder('chatUser')
      .where('chatUser.userId = :userId', { userId: userId2 })
      .andWhere('chatUser.chatId IN (:...chatIds)', { chatIds: personalChatIds })
      .leftJoinAndSelect('chatUser.chat', 'chat')
      .getMany();

    if (chatUsersForUser2.length === 0) {
      return null;
    }

    // Берем первый найденный чат
    const existingChatId = chatUsersForUser2[0].chatId;
    return this.findOne(existingChatId, userId1);
  }

  async markAsRead(chatId: number, userId: number): Promise<void> {
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    // Сбрасываем счётчик непрочитанных
    chatUser.unreadCount = 0;
    await this.chatUserRepository.save(chatUser);

    // Находим все непрочитанные сообщения от других пользователей
    const unreadMessages = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.id')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.status != :readStatus', { readStatus: MessageStatus.READ })
      .getMany();

    const messageIds = unreadMessages.map(m => m.id);

    // Обновляем статус всех сообщений в чате как прочитанные (кроме своих)
    if (messageIds.length > 0) {
      await this.messageRepository
        .createQueryBuilder()
        .update(Message)
        .set({ status: MessageStatus.READ })
        .where('chatId = :chatId AND senderId != :userId AND status != :readStatus', { 
          chatId, 
          userId,
          readStatus: MessageStatus.READ 
        })
        .execute();

      // Отправляем уведомление через Redis -> WebSocket
      try {
        this.logger.log(`[REDIS] Отправка уведомления о прочтении ${messageIds.length} сообщений в чате ${chatId}`);
        await this.redisPublisher.sendMessagesRead(chatId, userId, messageIds);
      } catch (error) {
        this.logger.error('Ошибка при отправке уведомления о прочтении через Redis:', error);
      }
    }
  }

  async markAsUnread(chatId: number, userId: number): Promise<void> {
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    chatUser.unreadCount = 1;
    await this.chatUserRepository.save(chatUser);
  }

  async togglePin(chatId: number, userId: number, isPinned: boolean): Promise<{ isPinned: boolean }> {
    // Проверяем, является ли пользователь участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    // Обновляем статус закрепления для конкретного пользователя
    chatUser.isPinned = isPinned;
    await this.chatUserRepository.save(chatUser);
    
    this.logger.log(`[togglePin] Чат ${chatId} для пользователя ${userId}: isPinned = ${chatUser.isPinned}`);
    
    return { isPinned: chatUser.isPinned };
  }

  async toggleMute(chatId: number, userId: number): Promise<{ isMuted: boolean }> {
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    chatUser.isMuted = !chatUser.isMuted;
    await this.chatUserRepository.save(chatUser);
    
    this.logger.log(`[toggleMute] Чат ${chatId} для пользователя ${userId}: isMuted = ${chatUser.isMuted}`);
    
    return { isMuted: chatUser.isMuted };
  }

  async leaveChat(chatId: number, userId: number): Promise<void> {
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
      relations: ['chat'],
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    // Если это личный чат, то просто удаляем связь
    if (chatUser.chat.type === ChatType.PERSONAL) {
      await this.chatUserRepository.remove(chatUser);
      return;
    }

    // Если это групповой чат, проверяем, является ли пользователь владельцем
    if (chatUser.role === ChatUserRole.OWNER) {
      // Находим другого админа или пользователя, которому можно передать владение
      const newOwner = await this.chatUserRepository.findOne({
        where: { 
          chatId,
          userId: userId,
          role: ChatUserRole.ADMIN
        },
      });

      if (newOwner) {
        // Если есть админ, делаем его владельцем
        newOwner.role = ChatUserRole.OWNER;
        await this.chatUserRepository.save(newOwner);
      } else {
        // Если нет админа, находим самого старого пользователя
        const oldestMember = await this.chatUserRepository.findOne({
          where: { chatId, userId },
          order: { createdAt: 'ASC' },
        });

        if (oldestMember && oldestMember.id !== chatUser.id) {
          oldestMember.role = ChatUserRole.OWNER;
          await this.chatUserRepository.save(oldestMember);
        } else {
          // Если нет других пользователей, удаляем чат
          await this.chatRepository.remove(chatUser.chat);
          return;
        }
      }
    }

    // Удаляем пользователя из чата
    await this.chatUserRepository.remove(chatUser);
  }

  // Добавляем метод для получения участников чата
  async getChatMembers(chatId: number, userId: number): Promise<any[]> {
    this.logger.log(`Запрос участников чата ID: ${chatId} от пользователя ID: ${userId}`);
    
    // Проверяем, является ли пользователь участником этого чата
    const userMembership = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });
    
    if (!userMembership) {
      this.logger.warn(`Пользователь ID: ${userId} не является участником чата ID: ${chatId}`);
      throw new NotFoundException(`Чат с ID ${chatId} не найден или вы не имеете доступа`);
    }
    
    // Получаем всех участников чата с их профилями
    const chatUsers = await this.chatUserRepository
      .createQueryBuilder('chatUser')
      .leftJoinAndSelect('chatUser.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('chatUser.chatId = :chatId', { chatId })
      .getMany();
    
    this.logger.log(`Найдено ${chatUsers.length} участников для чата ID: ${chatId}`);
    
    // Возвращаем участников с необходимыми данными
    return chatUsers.map(chatUser => ({
      id: chatUser.user.id,
      name: chatUser.user.firstName && chatUser.user.lastName 
        ? `${chatUser.user.firstName} ${chatUser.user.lastName}` 
        : `Пользователь ${chatUser.user.id}`,
      email: chatUser.user.email,
      role: chatUser.role,
      avatar: chatUser.user.profile?.avatar || null,
      firstName: chatUser.user.firstName || '',
      lastName: chatUser.user.lastName || '',
      isOnline: false // В реальном приложении здесь будет логика определения онлайн-статуса
    }));
  }

  async updateChatAvatar(chatId: number, userId: number, file: any): Promise<string> {
    // Проверяем, является ли пользователь участником чата с правами администратора
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    // Проверяем, имеет ли пользователь права для изменения аватара группы
    if (chatUser.role !== ChatUserRole.OWNER && chatUser.role !== ChatUserRole.ADMIN) {
      throw new BadRequestException('У вас нет прав для изменения аватара группы');
    }

    // Получаем чат
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Чат с ID ${chatId} не найден`);
    }

    // Конвертируем файл в base64 для хранения в БД
    const fs = require('fs');
    const path = require('path');
    
    // Читаем файл, который был загружен Multer
    const fileData = fs.readFileSync(file.path);
    
    // Конвертируем в base64
    const avatarBase64 = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
    
    // Удаляем временный файл
    fs.unlinkSync(file.path);
    
    // Обновляем аватар в БД
    chat.avatar = avatarBase64;
    await this.chatRepository.save(chat);
    
    return avatarBase64;
  }

  async updateChatAvatarUrl(chatId: number, userId: number, avatarUrl: string): Promise<void> {
    // Проверяем, является ли пользователь участником чата с правами администратора
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    // Проверяем, имеет ли пользователь права для изменения аватара группы
    if (chatUser.role !== ChatUserRole.OWNER && chatUser.role !== ChatUserRole.ADMIN) {
      throw new BadRequestException('У вас нет прав для изменения аватара группы');
    }

    // Получаем чат
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Чат с ID ${chatId} не найден`);
    }

    // Обновляем аватар в БД
    chat.avatar = avatarUrl;
    await this.chatRepository.save(chat);
  }

  async updateChat(chatId: number, userId: number, updateData: { name?: string; description?: string }): Promise<Chat> {
    this.logger.log(`[updateChat] Начало обновления чата ${chatId}, пользователь ${userId}, данные:`, updateData);
    
    try {
      // Проверяем, является ли пользователь участником чата с правами администратора
      const chatUser = await this.chatUserRepository.findOne({
        where: { chatId, userId },
      });

      if (!chatUser) {
        this.logger.error(`[updateChat] Чат не найден или пользователь не имеет доступа: chatId=${chatId}, userId=${userId}`);
        throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
      }

      this.logger.log(`[updateChat] Найден chatUser:`, chatUser);

      // Проверяем, имеет ли пользователь права для изменения информации о группе
      if (chatUser.role !== ChatUserRole.OWNER && chatUser.role !== ChatUserRole.ADMIN) {
        this.logger.error(`[updateChat] Недостаточно прав для изменения: роль=${chatUser.role}`);
        throw new BadRequestException('У вас нет прав для изменения информации о группе');
      }

      // Получаем чат
      const chat = await this.chatRepository.findOne({ where: { id: chatId } });
      if (!chat) {
        this.logger.error(`[updateChat] Чат с ID ${chatId} не найден`);
        throw new NotFoundException(`Чат с ID ${chatId} не найден`);
      }

      this.logger.log(`[updateChat] Найден чат:`, chat);

      // Обновляем только предоставленные поля
      if (updateData.name !== undefined) {
        this.logger.log(`[updateChat] Обновление названия: ${chat.name} -> ${updateData.name}`);
        chat.name = updateData.name;
      }
      if (updateData.description !== undefined) {
        this.logger.log(`[updateChat] Обновление описания: ${chat.description} -> ${updateData.description}`);
        chat.description = updateData.description;
      }

      // Сохраняем обновленный чат
      this.logger.log(`[updateChat] Сохранение изменений чата:`, chat);
      const savedChat = await this.chatRepository.save(chat);
      this.logger.log(`[updateChat] Чат успешно сохранен:`, savedChat);
      
      // Возвращаем обновленный чат
      return this.findOne(chatId, userId);
    } catch (error) {
      this.logger.error(`[updateChat] Ошибка при обновлении чата ${chatId}:`, error);
      throw error;
    }
  }

  async addUserToChat(chatId: number, currentUserId: number, targetUserId: number): Promise<any> {
    this.logger.log(`[addUserToChat] Добавление пользователя ${targetUserId} в чат ${chatId} от пользователя ${currentUserId}`);
    
    // Проверяем, является ли пользователь участником чата с правами администратора
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId: currentUserId },
      relations: ['chat'],
    });
    
    if (!chatUser) {
      this.logger.error(`[addUserToChat] Пользователь ${currentUserId} не имеет доступа к чату ${chatId}`);
      throw new NotFoundException(`Чат с ID ${chatId} не найден или вы не имеете доступа`);
    }
    
    // Проверяем тип чата - добавление пользователей возможно только для групповых чатов
    if (chatUser.chat.type !== ChatType.GROUP) {
      this.logger.error(`[addUserToChat] Нельзя добавить пользователя в личный чат ${chatId}`);
      throw new BadRequestException('Добавление пользователей возможно только для групповых чатов');
    }
    
    // Проверяем, имеет ли пользователь права для добавления участников
    if (chatUser.role !== ChatUserRole.OWNER && chatUser.role !== ChatUserRole.ADMIN) {
      this.logger.error(`[addUserToChat] Пользователь ${currentUserId} не имеет прав для добавления участников в чат ${chatId}`);
      throw new BadRequestException('У вас нет прав для добавления участников в группу');
    }
    
    // Проверяем существование добавляемого пользователя
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      this.logger.error(`[addUserToChat] Пользователь с ID ${targetUserId} не найден`);
      throw new NotFoundException(`Пользователь с ID ${targetUserId} не найден`);
    }
    
    // Проверяем, не является ли пользователь уже участником чата
    const existingMember = await this.chatUserRepository.findOne({
      where: { chatId, userId: targetUserId },
    });
    
    if (existingMember) {
      this.logger.warn(`[addUserToChat] Пользователь ${targetUserId} уже является участником чата ${chatId}`);
      return { message: 'Пользователь уже является участником группы' };
    }
    
    // Создаем нового участника чата с ролью участника
    const newChatUser = this.chatUserRepository.create({
      chatId,
      userId: targetUserId,
      role: ChatUserRole.MEMBER,
    });
    
    try {
      await this.chatUserRepository.save(newChatUser);
      this.logger.log(`[addUserToChat] Пользователь ${targetUserId} успешно добавлен в чат ${chatId}`);
      
      // Возвращаем информацию о добавленном пользователе
      const addedUser = await this.userRepository.findOne({
        where: { id: targetUserId },
        relations: ['profile']
      });
      
      if (!addedUser) {
        this.logger.error(`[addUserToChat] Не удалось найти добавленного пользователя ${targetUserId} после сохранения`);
        return { message: 'Пользователь успешно добавлен в группу' };
      }
      
      return {
        message: 'Пользователь успешно добавлен в группу',
        user: {
          id: addedUser.id,
          name: addedUser.firstName && addedUser.lastName 
            ? `${addedUser.firstName} ${addedUser.lastName}` 
            : `Пользователь ${addedUser.id}`,
          email: addedUser.email,
          role: ChatUserRole.MEMBER,
          avatar: addedUser.profile?.avatar || null,
          firstName: addedUser.firstName || '',
          lastName: addedUser.lastName || '',
        }
      };
    } catch (error) {
      this.logger.error(`[addUserToChat] Ошибка при добавлении пользователя ${targetUserId} в чат ${chatId}:`, error);
      throw new InternalServerErrorException('Ошибка при добавлении пользователя в группу');
    }
  }

  // Блокировка пользователя в личном чате
  async blockUser(chatId: number, userId: number): Promise<{ isBlocked: boolean; blockedUserId: number }> {
    this.logger.log(`[blockUser] Пользователь ${userId} блокирует в чате ${chatId}`);
    
    // Проверяем, что это личный чат
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Чат с ID ${chatId} не найден`);
    }
    
    if (chat.type !== ChatType.PERSONAL) {
      throw new BadRequestException('Блокировка доступна только в личных чатах');
    }
    
    // Находим другого участника чата
    const chatUsers = await this.chatUserRepository.find({ where: { chatId } });
    const otherChatUser = chatUsers.find(cu => cu.userId !== userId);
    
    if (!otherChatUser) {
      throw new NotFoundException('Собеседник не найден');
    }
    
    // Переключаем статус блокировки
    const newBlockedState = !otherChatUser.isBlocked;
    otherChatUser.isBlocked = newBlockedState;
    otherChatUser.blockedByUserId = newBlockedState ? userId : null;
    await this.chatUserRepository.save(otherChatUser);
    
    // Отправляем уведомление через Redis
    try {
      await this.redisPublisher.publish('chat:userBlocked', {
        chatId,
        blockedUserId: otherChatUser.userId,
        blockedByUserId: userId,
        isBlocked: newBlockedState
      });
    } catch (error) {
      this.logger.error('Ошибка при отправке уведомления о блокировке:', error);
    }
    
    this.logger.log(`[blockUser] Пользователь ${otherChatUser.userId} ${newBlockedState ? 'заблокирован' : 'разблокирован'} в чате ${chatId}`);
    
    return { isBlocked: newBlockedState, blockedUserId: otherChatUser.userId };
  }

  // Удаление личного чата (для обоих пользователей)
  async deletePersonalChat(chatId: number, userId: number): Promise<void> {
    this.logger.log(`[deletePersonalChat] Удаление чата ${chatId} пользователем ${userId}`);
    
    // Проверяем, что пользователь участник чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
      relations: ['chat'],
    });
    
    if (!chatUser) {
      throw new NotFoundException(`Чат с ID ${chatId} не найден или вы не имеете доступа`);
    }
    
    // Проверяем, что это личный чат
    if (chatUser.chat.type !== ChatType.PERSONAL) {
      throw new BadRequestException('Этот метод только для личных чатов');
    }
    
    // Получаем всех участников чата для уведомления
    const chatUsers = await this.chatUserRepository.find({ where: { chatId } });
    const participantIds = chatUsers.map(cu => cu.userId);
    
    // Удаляем все сообщения чата
    await this.messageRepository.delete({ chatId });
    
    // Удаляем связи пользователей с чатом
    await this.chatUserRepository.delete({ chatId });
    
    // Удаляем сам чат
    await this.chatRepository.delete({ id: chatId });
    
    // Отправляем уведомление через Redis всем участникам
    try {
      await this.redisPublisher.publish('chat:deleted', {
        chatId,
        participantIds,
        deletedByUserId: userId
      });
    } catch (error) {
      this.logger.error('Ошибка при отправке уведомления об удалении чата:', error);
    }
    
    this.logger.log(`[deletePersonalChat] Чат ${chatId} успешно удалён`);
  }

  // Проверка блокировки в чате
  async checkBlockStatus(chatId: number, userId: number): Promise<{ isBlocked: boolean; blockedByMe: boolean }> {
    const chatUsers = await this.chatUserRepository.find({ where: { chatId } });
    
    const myChatUser = chatUsers.find(cu => cu.userId === userId);
    const otherChatUser = chatUsers.find(cu => cu.userId !== userId);
    
    if (!myChatUser || !otherChatUser) {
      return { isBlocked: false, blockedByMe: false };
    }
    
    // Проверяем, заблокирован ли я другим пользователем
    const isBlockedByOther = myChatUser.isBlocked && myChatUser.blockedByUserId === otherChatUser.userId;
    
    // Проверяем, заблокировал ли я другого пользователя
    const blockedByMe = otherChatUser.isBlocked && otherChatUser.blockedByUserId === userId;
    
    return { 
      isBlocked: isBlockedByOther, 
      blockedByMe 
    };
  }
} 