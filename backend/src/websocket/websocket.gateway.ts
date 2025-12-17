import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly websocketService: WebsocketService,
  ) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`Invalid token for client ${client.id}`);
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      // Сохраняем userId в данных сокета
      client.data.userId = userId;
      
      // Добавляем пользователя в список подключенных
      this.websocketService.addUser(userId, client);

      // Присоединяем к персональной комнате
      client.join(`user:${userId}`);

      // Уведомляем о подключении
      client.emit('connected', {
        userId,
        socketId: client.id,
        onlineUsers: this.websocketService.getOnlineUsers(),
      });

      // Уведомляем других о том, что пользователь онлайн
      client.broadcast.emit('user:online', { userId });

      this.logger.log(`User ${userId} connected. Socket: ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.websocketService.removeUser(client.id);
    
    if (userId && !this.websocketService.isUserOnline(userId)) {
      // Уведомляем других, что пользователь оффлайн
      this.server.emit('user:offline', { userId });
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | null {
    // Пробуем получить токен из разных источников
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = client.handshake.auth?.token;
    if (token) {
      return token;
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }

  // ==================== CHAT EVENTS ====================

  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number },
  ) {
    const userId = client.data.userId;
    const room = `chat:${data.chatId}`;
    
    client.join(room);
    this.logger.log(`User ${userId} joined chat room ${room}`);
    
    return { success: true, room };
  }

  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number },
  ) {
    const userId = client.data.userId;
    const room = `chat:${data.chatId}`;
    
    client.leave(room);
    this.logger.log(`User ${userId} left chat room ${room}`);
    
    return { success: true };
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    const room = `chat:${data.chatId}`;
    
    // Отправляем всем в комнате кроме отправителя
    client.to(room).emit('chat:typing', {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    });
    
    return { success: true };
  }

  @SubscribeMessage('chat:read')
  handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number; messageId: number },
  ) {
    const userId = client.data.userId;
    const room = `chat:${data.chatId}`;
    
    client.to(room).emit('chat:read', {
      chatId: data.chatId,
      messageId: data.messageId,
      userId,
    });
    
    return { success: true };
  }

  // ==================== PROJECT EVENTS ====================

  @SubscribeMessage('project:join')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    const userId = client.data.userId;
    const room = `project:${data.projectId}`;
    
    client.join(room);
    this.logger.log(`User ${userId} joined project room ${room}`);
    
    return { success: true, room };
  }

  @SubscribeMessage('project:leave')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    const room = `project:${data.projectId}`;
    client.leave(room);
    
    return { success: true };
  }

  // ==================== COMMUNITY EVENTS ====================

  @SubscribeMessage('community:join')
  handleJoinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: number },
  ) {
    const userId = client.data.userId;
    const room = `community:${data.communityId}`;
    
    client.join(room);
    this.logger.log(`User ${userId} joined community room ${room}`);
    
    return { success: true, room };
  }

  @SubscribeMessage('community:leave')
  handleLeaveCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: number },
  ) {
    const room = `community:${data.communityId}`;
    client.leave(room);
    
    return { success: true };
  }

  // ==================== UTILITY METHODS ====================

  // Отправить новое сообщение в чат
  sendNewMessage(chatId: number, message: any) {
    this.server.to(`chat:${chatId}`).emit('chat:newMessage', message);
  }

  // Отправить уведомление о редактировании сообщения
  sendMessageEdited(chatId: number, message: any) {
    this.server.to(`chat:${chatId}`).emit('chat:messageEdited', message);
  }

  // Отправить уведомление об удалении сообщения
  sendMessageDeleted(chatId: number, messageId: number) {
    this.server.to(`chat:${chatId}`).emit('chat:messageDeleted', { chatId, messageId });
  }

  // Отправить уведомление пользователю
  sendNotification(userId: number, notification: any) {
    this.websocketService.sendToUser(userId, 'notification', notification);
  }

  // Отправить обновление проекта
  sendProjectUpdate(projectId: number, update: any) {
    this.server.to(`project:${projectId}`).emit('project:update', update);
  }

  // Отправить обновление сообщества
  sendCommunityUpdate(communityId: number, update: any) {
    this.server.to(`community:${communityId}`).emit('community:update', update);
  }

  // Отправить обновление крипто-данных всем
  sendCryptoUpdate(data: any) {
    this.server.emit('crypto:update', data);
  }

  // Отправить обновление курсов валют
  sendExchangeRatesUpdate(data: any) {
    this.server.emit('exchangeRates:update', data);
  }
}
