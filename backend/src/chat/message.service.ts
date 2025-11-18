import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ChatUser } from './entities/chat-user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageStatus } from './enums/message-status.enum';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatUser)
    private chatUserRepository: Repository<ChatUser>,
  ) {}

  async create(createMessageDto: CreateMessageDto, userId: number): Promise<Message> {
    // Проверяем, что пользователь является участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId: createMessageDto.chatId, userId },
    });

    if (!chatUser) {
      throw new BadRequestException('Вы не можете отправлять сообщения в этот чат');
    }

    // Создаем новое сообщение
    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId: userId,
      status: MessageStatus.SENT,
    });

    // Сохраняем сообщение
    const savedMessage = await this.messageRepository.save(message);

    // Обновляем счетчик непрочитанных сообщений для всех участников, кроме отправителя
    await this.updateUnreadCounts(createMessageDto.chatId, userId);

    // Возвращаем сообщение с данными об отправителе
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'senderProfile')
      .where('message.id = :id', { id: savedMessage.id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`Сообщение с ID ${savedMessage.id} не найдено`);
    }

    console.log(`Создано новое сообщение ID: ${result.id} отправитель: ${result.sender?.firstName || ''} ${result.sender?.lastName || ''}`);

    return result;
  }

  async findAll(chatId: number, userId: number): Promise<Message[]> {
    // Проверяем, что пользователь является участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new BadRequestException('Вы не имеете доступа к сообщениям этого чата');
    }

    // Находим все сообщения в чате с полными данными пользователей
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'senderProfile')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replyToSender')
      .leftJoinAndSelect('replyToSender.profile', 'replyToSenderProfile')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
    
    console.log(`Получено ${messages.length} сообщений для чата ${chatId} с полными данными отправителей`);
    
    return messages;
  }

  async markAsRead(messageId: number, userId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['chat'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // Проверяем, что пользователь является участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId: message.chatId, userId },
    });

    if (!chatUser) {
      throw new BadRequestException('Вы не имеете доступа к этому сообщению');
    }

    // Если пользователь не является отправителем и сообщение не прочитано
    if (message.senderId !== userId && message.status !== MessageStatus.READ) {
      message.status = MessageStatus.READ;
      await this.messageRepository.save(message);
    }
  }

  async markAllAsRead(chatId: number, userId: number): Promise<void> {
    // Проверяем, что пользователь является участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new BadRequestException('Вы не имеете доступа к этому чату');
    }

    // Обновляем статус всех сообщений, которые не были отправлены пользователем
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .where('chatId = :chatId AND senderId != :userId', { chatId, userId })
      .execute();

    // Сбрасываем счетчик непрочитанных сообщений
    chatUser.unreadCount = 0;
    await this.chatUserRepository.save(chatUser);
  }

  async addReaction(messageId: number, userId: number, reaction: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['chat'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // Проверяем, что пользователь является участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId: message.chatId, userId },
    });

    if (!chatUser) {
      throw new BadRequestException('Вы не имеете доступа к этому сообщению');
    }

    // Обновляем реакции
    if (!message.reactions) {
      message.reactions = {};
    }

    if (message.reactions[reaction]) {
      message.reactions[reaction]++;
    } else {
      message.reactions[reaction] = 1;
    }

    return this.messageRepository.save(message);
  }

  async removeReaction(messageId: number, userId: number, reaction: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['chat'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // Проверяем, что пользователь является участником чата
    const chatUser = await this.chatUserRepository.findOne({
      where: { chatId: message.chatId, userId },
    });

    if (!chatUser) {
      throw new BadRequestException('Вы не имеете доступа к этому сообщению');
    }

    // Обновляем реакции
    if (message.reactions && message.reactions[reaction]) {
      if (message.reactions[reaction] > 1) {
        message.reactions[reaction]--;
      } else {
        delete message.reactions[reaction];
      }
      return this.messageRepository.save(message);
    }

    return message;
  }

  /**
   * Пересылка сообщения в другой чат
   */
  async forwardMessage(messageId: number, targetChatId: number, userId: number): Promise<Message> {
    console.log(`Попытка переслать сообщение ${messageId} в чат ${targetChatId} пользователем ${userId}`);
    
    // Проверяем, существует ли исходное сообщение
    const originalMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'chat'],
    });

    if (!originalMessage) {
      throw new NotFoundException(`Сообщение с ID ${messageId} не найдено`);
    }

    // Проверяем, имеет ли пользователь доступ к исходному сообщению
    const sourceChatUser = await this.chatUserRepository.findOne({
      where: { chatId: originalMessage.chatId, userId },
    });

    if (!sourceChatUser) {
      throw new ForbiddenException('У вас нет доступа к исходному сообщению');
    }

    // Проверяем, имеет ли пользователь доступ к целевому чату
    const targetChatUser = await this.chatUserRepository.findOne({
      where: { chatId: targetChatId, userId },
    });

    if (!targetChatUser) {
      throw new ForbiddenException('У вас нет доступа к целевому чату');
    }

    // Создаем новое сообщение в целевом чате с текстом исходного
    const newMessage = this.messageRepository.create({
      chatId: targetChatId,
      senderId: userId,
      text: originalMessage.text,
      status: MessageStatus.SENT,
      forwardedFromId: originalMessage.id,
      type: originalMessage.type,
      fileUrl: originalMessage.fileUrl,
      fileName: originalMessage.fileName,
      fileSize: originalMessage.fileSize,
    });

    // Сохраняем пересланное сообщение
    const savedMessage = await this.messageRepository.save(newMessage);

    // Обновляем счетчик непрочитанных сообщений для участников целевого чата
    await this.updateUnreadCounts(targetChatId, userId);

    // Возвращаем сообщение с данными об отправителе
    const result = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'forwardedFrom', 'forwardedFrom.sender'],
    });
    
    if (!result) {
      throw new NotFoundException(`Пересланное сообщение с ID ${savedMessage.id} не найдено`);
    }
    
    console.log(`Сообщение ${messageId} успешно переслано в чат ${targetChatId} с новым ID ${result.id}`);
    return result;
  }

  private async updateUnreadCounts(chatId: number, senderId: number): Promise<void> {
    try {
      console.log(`Обновление счетчика непрочитанных сообщений для чата ${chatId}, отправитель: ${senderId}`);
      
      // Проверяем входные данные
      if (!chatId || !senderId) {
        console.warn('Некорректные параметры для updateUnreadCounts:', { chatId, senderId });
        return;
      }

      // Находим всех участников чата, кроме отправителя, через QueryBuilder
      const chatUsers = await this.chatUserRepository
        .createQueryBuilder('chatUser')
        .where('chatUser.chatId = :chatId', { chatId })
        .andWhere('chatUser.userId != :senderId', { senderId })
        .getMany();

      // Проверяем, есть ли участники чата
      if (!chatUsers || chatUsers.length === 0) {
        console.log(`Нет других участников в чате ${chatId} для обновления счетчика непрочитанных сообщений`);
        return;
      }

      console.log(`Найдено ${chatUsers.length} участников для обновления счетчика непрочитанных сообщений`);

      // Увеличиваем счетчик непрочитанных сообщений для каждого участника
      for (const chatUser of chatUsers) {
        try {
          // Убедимся, что unreadCount - это число
          const currentCount = typeof chatUser.unreadCount === 'number' ? chatUser.unreadCount : 0;
          chatUser.unreadCount = currentCount + 1;
          await this.chatUserRepository.save(chatUser);
          console.log(`Счетчик непрочитанных сообщений для пользователя ${chatUser.userId} обновлен: ${currentCount} -> ${chatUser.unreadCount}`);
        } catch (err) {
          console.error(`Ошибка при обновлении счетчика для пользователя ${chatUser.userId}:`, err);
        }
      }
    } catch (error) {
      // Не блокируем основной процесс, если возникла ошибка при обновлении счетчиков
      console.error('Ошибка при обновлении счетчика непрочитанных сообщений:', error);
    }
  }
} 