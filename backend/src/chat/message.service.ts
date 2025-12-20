import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ChatUser } from './entities/chat-user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageStatus } from './enums/message-status.enum';
import { RedisPublisherService } from '../redis/redis-publisher.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatUser)
    private chatUserRepository: Repository<ChatUser>,
    private redisPublisher: RedisPublisherService,
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

    // Возвращаем сообщение с данными об отправителе и replyTo
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'senderProfile')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replyToSender')
      .leftJoinAndSelect('replyToSender.profile', 'replyToSenderProfile')
      .where('message.id = :id', { id: savedMessage.id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`Сообщение с ID ${savedMessage.id} не найдено`);
    }

    console.log(`Создано новое сообщение ID: ${result.id} отправитель: ${result.sender?.firstName || ''} ${result.sender?.lastName || ''}, replyTo: ${result.replyTo?.id || 'нет'}`);

    // Получаем всех участников чата для отправки уведомлений
    try {
      const chatUsers = await this.chatUserRepository.find({
        where: { chatId: createMessageDto.chatId },
      });
      const participantIds = chatUsers.map(cu => cu.userId);
      
      console.log(`[REDIS] Отправка сообщения ${result.id} в чат ${createMessageDto.chatId}, участники: ${participantIds.join(', ')}`);
      await this.redisPublisher.sendChatMessage(createMessageDto.chatId, result, participantIds);
    } catch (error) {
      console.error('Ошибка при отправке сообщения через Redis:', error);
    }

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

  async editMessage(messageId: number, userId: number, newText: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'sender.profile'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // Проверяем, что пользователь является автором сообщения
    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои сообщения');
    }

    message.text = newText;
    message.isEdited = true;
    const savedMessage = await this.messageRepository.save(message);

    // Отправляем уведомление через Redis -> WebSocket сервер
    try {
      await this.redisPublisher.sendMessageEdited(message.chatId, savedMessage);
    } catch (error) {
      console.error('Ошибка при отправке уведомления о редактировании через Redis:', error);
    }

    return savedMessage;
  }

  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // Проверяем, что пользователь является автором сообщения
    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои сообщения');
    }

    const chatId = message.chatId;
    await this.messageRepository.remove(message);

    // Отправляем уведомление через Redis -> WebSocket сервер
    try {
      await this.redisPublisher.sendMessageDeleted(chatId, messageId);
    } catch (error) {
      console.error('Ошибка при отправке уведомления об удалении через Redis:', error);
    }
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

    // Обновляем реакции - теперь храним массив userId
    if (!message.reactions) {
      message.reactions = {};
    }

    if (!message.reactions[reaction]) {
      message.reactions[reaction] = [];
    }

    // Проверяем, не поставил ли пользователь уже эту реакцию
    if (!message.reactions[reaction].includes(userId)) {
      message.reactions[reaction].push(userId);
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
      // Удаляем userId из массива
      message.reactions[reaction] = message.reactions[reaction].filter(id => id !== userId);
      
      // Если массив пустой - удаляем ключ
      if (message.reactions[reaction].length === 0) {
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