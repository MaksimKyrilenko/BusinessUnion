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
import { Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';
import { RedisService } from './redis.service';

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
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly websocketService: WebsocketService,
    private readonly redisService: RedisService,
  ) {
    this.logger.log('=== WebSocket Gateway Constructor ===');
    this.logger.log(`WS_CORS_ORIGIN: ${process.env.WS_CORS_ORIGIN || '*'}`);
  }

  onModuleInit() {
    // Регистрируем обработчики Redis событий
    this.setupRedisHandlers();
  }

  private setupRedisHandlers() {
    this.logger.log('=== Setting up Redis event handlers ===');

    // Новое сообщение в чат
    this.redisService.onMessage('chat:newMessage', (data) => {
      this.logger.log(`[REDIS->WS] chat:newMessage for chat ${data.chatId}, participants: ${data.participantIds?.join(', ') || 'none'}`);
      this.sendNewMessage(data.chatId, data.message, data.participantIds);
    });

    // Сообщение отредактировано
    this.redisService.onMessage('chat:messageEdited', (data) => {
      this.logger.log(`[REDIS->WS] chat:messageEdited for chat ${data.chatId}`);
      this.sendMessageEdited(data.chatId, data.message);
    });

    // Сообщение удалено
    this.redisService.onMessage('chat:messageDeleted', (data) => {
      this.logger.log(`[REDIS->WS] chat:messageDeleted for chat ${data.chatId}`);
      this.sendMessageDeleted(data.chatId, data.messageId);
    });

    // Уведомление пользователю
    this.redisService.onMessage('notification', (data) => {
      this.logger.log(`[REDIS->WS] notification for user ${data.userId}`);
      this.sendNotification(data.userId, data.notification);
    });

    // Обновление проекта
    this.redisService.onMessage('project:update', (data) => {
      this.logger.log(`[REDIS->WS] project:update for project ${data.projectId}`);
      this.sendProjectUpdate(data.projectId, data.update);
    });

    // Обновление сообщества
    this.redisService.onMessage('community:update', (data) => {
      this.logger.log(`[REDIS->WS] community:update for community ${data.communityId}`);
      this.sendCommunityUpdate(data.communityId, data.update);
    });

    // Крипто обновления
    this.redisService.onMessage('crypto:update', (data) => {
      this.sendCryptoUpdate(data.data);
    });

    // Курсы валют
    this.redisService.onMessage('exchangeRates:update', (data) => {
      this.sendExchangeRatesUpdate(data.data);
    });

    this.logger.log('Redis event handlers registered');
  }

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    this.logger.log('=== WebSocket Gateway Initialized ===');
    this.logger.log(`Server instance created: ${!!server}`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`=== New Connection Attempt ===`);
    this.logger.log(`Socket ID: ${client.id}`);
    this.logger.log(`Transport: ${client.conn?.transport?.name || 'unknown'}`);
    this.logger.log(`Remote Address: ${client.handshake.address}`);
    this.logger.log(`Origin: ${client.handshake.headers.origin || 'no-origin'}`);

    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`[${client.id}] No token provided`);
        this.logger.warn(`Auth header: ${client.handshake.headers.authorization || 'none'}`);
        this.logger.warn(`Auth object: ${JSON.stringify(client.handshake.auth || {})}`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      this.logger.log(`[${client.id}] Token received (length: ${token.length})`);

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`[${client.id}] Invalid token - no userId in payload`);
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      this.logger.log(`[${client.id}] Token verified. User ID: ${userId}`);

      client.data.userId = userId;
      this.websocketService.addUser(userId, client);
      client.join(`user:${userId}`);

      const onlineUsers = this.websocketService.getOnlineUsers();
      client.emit('connected', {
        userId,
        socketId: client.id,
        onlineUsers,
      });

      client.broadcast.emit('user:online', { userId });

      this.logger.log(`=== User ${userId} Connected Successfully ===`);
      this.logger.log(`Total connections: ${this.websocketService.getTotalConnectionsCount()}`);
    } catch (error) {
      this.logger.error(`=== Connection Error ===`);
      this.logger.error(`Socket: ${client.id}`);
      this.logger.error(`Error: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`=== Client Disconnecting ===`);
    this.logger.log(`Socket ID: ${client.id}`);
    this.logger.log(`User ID: ${client.data?.userId || 'unknown'}`);

    const userId = this.websocketService.removeUser(client.id);

    if (userId && !this.websocketService.isUserOnline(userId)) {
      this.server.emit('user:offline', { userId });
      this.logger.log(`User ${userId} is now offline`);
    }

    this.logger.log(`Remaining connections: ${this.websocketService.getTotalConnectionsCount()}`);
  }

  private extractToken(client: Socket): string | null {
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
    this.logger.log(`[CHAT:JOIN] User ${userId} joined room ${room}`);

    const rooms = Array.from(client.rooms);
    this.logger.log(`[CHAT:JOIN] Client ${client.id} rooms: ${rooms.join(', ')}`);

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
    this.logger.log(`[CHAT:LEAVE] User ${userId} left room ${room}`);

    return { success: true };
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    const room = `chat:${data.chatId}`;

    this.logger.log(`[CHAT:TYPING] User ${userId} typing=${data.isTyping} in room ${room}`);

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

    this.logger.log(`[CHAT:READ] User ${userId} read message ${data.messageId} in room ${room}`);

    client.to(room).emit('chat:read', {
      chatId: data.chatId,
      messageId: data.messageId,
      userId,
    });

    return { success: true };
  }

  // ==================== PROJECT/COMMUNITY EVENTS ====================

  @SubscribeMessage('project:join')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    const room = `project:${data.projectId}`;
    client.join(room);
    this.logger.log(`[PROJECT:JOIN] User ${client.data.userId} joined ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('project:leave')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    client.leave(`project:${data.projectId}`);
    return { success: true };
  }

  @SubscribeMessage('community:join')
  handleJoinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: number },
  ) {
    const room = `community:${data.communityId}`;
    client.join(room);
    this.logger.log(`[COMMUNITY:JOIN] User ${client.data.userId} joined ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('community:leave')
  handleLeaveCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: number },
  ) {
    client.leave(`community:${data.communityId}`);
    return { success: true };
  }

  // ==================== SEND METHODS ====================

  sendNewMessage(chatId: number, message: any, participantIds?: number[]) {
    const room = `chat:${chatId}`;
    
    this.logger.log(`=== SENDING NEW MESSAGE ===`);
    this.logger.log(`Room: ${room}`);
    this.logger.log(`Message ID: ${message?.id}`);
    this.logger.log(`Sender ID: ${message?.senderId}`);
    this.logger.log(`Participants: ${participantIds?.join(', ') || 'none'}`);
    
    if (!this.server) {
      this.logger.error(`Server not initialized, cannot send message`);
      return;
    }
    
    // Отправляем в комнату чата (для тех кто открыл этот чат)
    this.server.to(room).emit('chat:newMessage', message);
    this.logger.log(`Event 'chat:newMessage' emitted to room ${room}`);
    
    // Также отправляем всем участникам чата персонально (в их user:X комнаты)
    // Это гарантирует что они получат сообщение даже если не в этом чате
    if (participantIds && participantIds.length > 0) {
      for (const odId of participantIds) {
        const userRoom = `user:${odId}`;
        this.server.to(userRoom).emit('chat:newMessage', message);
        this.logger.log(`Event 'chat:newMessage' also sent to ${userRoom}`);
      }
    }
  }

  sendMessageEdited(chatId: number, message: any) {
    const room = `chat:${chatId}`;
    this.logger.log(`[SEND:EDITED] Message ${message?.id} in room ${room}`);
    this.server.to(room).emit('chat:messageEdited', message);
  }

  sendMessageDeleted(chatId: number, messageId: number) {
    const room = `chat:${chatId}`;
    this.logger.log(`[SEND:DELETED] Message ${messageId} in room ${room}`);
    this.server.to(room).emit('chat:messageDeleted', { chatId, messageId });
  }

  sendNotification(userId: number, notification: any) {
    this.websocketService.sendToUser(userId, 'notification', notification);
  }

  sendProjectUpdate(projectId: number, update: any) {
    this.server.to(`project:${projectId}`).emit('project:update', update);
  }

  sendCommunityUpdate(communityId: number, update: any) {
    this.server.to(`community:${communityId}`).emit('community:update', update);
  }

  sendCryptoUpdate(data: any) {
    this.server.emit('crypto:update', data);
  }

  sendExchangeRatesUpdate(data: any) {
    this.server.emit('exchangeRates:update', data);
  }
}
