import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatUser } from './entities/chat-user.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, ChatUser, User]),
    UsersModule,
  ],
  controllers: [ChatController, MessageController],
  providers: [ChatService, MessageService],
  exports: [ChatService, MessageService],
})
export class ChatModule {} 