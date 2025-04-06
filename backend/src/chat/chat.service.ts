import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatUser } from './entities/chat-user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatType } from './enums/chat-type.enum';
import { ChatUserRole } from './enums/chat-user-role.enum';
import { User } from '../users/user.entity';
import { Logger } from '@nestjs/common';

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

    // Найти все чаты с сообщениями и участниками
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'chatUser')
      .leftJoinAndSelect('chatUser.user', 'user')
      .leftJoinAndSelect('chat.messages', 'messages')
      .where('chat.id IN (:...chatIds)', { chatIds })
      .orderBy('messages.createdAt', 'DESC')
      .getMany();

    return chats;
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
      .leftJoinAndSelect('chat.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .leftJoinAndSelect('messages.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replyToSender')
      .where('chat.id = :id', { id })
      .orderBy('messages.createdAt', 'ASC')
      .getOne();

    if (!chat) {
      throw new NotFoundException(`Чат с ID ${id} не найден`);
    }

    return chat;
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

    chatUser.unreadCount = 0;
    await this.chatUserRepository.save(chatUser);
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

  async togglePin(chatId: number, userId: number, isPinned: boolean): Promise<void> {
    // Проверяем, является ли пользователь участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    // Обновляем статус закрепления чата
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    
    if (!chat) {
      throw new NotFoundException(`Чат с ID ${chatId} не найден`);
    }
    
    chat.isPinned = isPinned;
    await this.chatRepository.save(chat);
  }

  async toggleMute(chatId: number, userId: number): Promise<void> {
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new NotFoundException(`Чат не найден или вы не имеете доступа`);
    }

    chatUser.isMuted = !chatUser.isMuted;
    await this.chatUserRepository.save(chatUser);
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
} 