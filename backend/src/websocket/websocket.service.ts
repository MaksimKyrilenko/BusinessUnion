import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface ConnectedUser {
  odId: number;
  socketId: string;
  socket: Socket;
  connectedAt: Date;
}

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);
  private server: Server;
  private connectedUsers: Map<number, ConnectedUser[]> = new Map();

  setServer(server: Server) {
    this.server = server;
  }

  getServer(): Server {
    return this.server;
  }

  // Добавить пользователя в список подключенных
  addUser(userId: number, socket: Socket): void {
    const userConnections = this.connectedUsers.get(userId) || [];
    userConnections.push({
      odId: userId,
      socketId: socket.id,
      socket,
      connectedAt: new Date(),
    });
    this.connectedUsers.set(userId, userConnections);
    this.logger.log(`User ${userId} connected. Socket: ${socket.id}. Total connections: ${userConnections.length}`);
  }

  // Удалить соединение пользователя
  removeUser(socketId: string): number | null {
    for (const [userId, connections] of this.connectedUsers.entries()) {
      const index = connections.findIndex(c => c.socketId === socketId);
      if (index !== -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.connectedUsers.delete(userId);
        }
        this.logger.log(`User ${userId} disconnected. Socket: ${socketId}`);
        return userId;
      }
    }
    return null;
  }

  // Проверить, онлайн ли пользователь
  isUserOnline(userId: number): boolean {
    const connections = this.connectedUsers.get(userId);
    return connections !== undefined && connections.length > 0;
  }

  // Получить все сокеты пользователя
  getUserSockets(userId: number): Socket[] {
    const connections = this.connectedUsers.get(userId);
    return connections ? connections.map(c => c.socket) : [];
  }

  // Получить список онлайн пользователей
  getOnlineUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Отправить событие конкретному пользователю
  sendToUser(userId: number, event: string, data: any): void {
    const sockets = this.getUserSockets(userId);
    sockets.forEach(socket => {
      socket.emit(event, data);
    });
  }

  // Отправить событие нескольким пользователям
  sendToUsers(userIds: number[], event: string, data: any): void {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }

  // Отправить событие всем подключенным пользователям
  broadcast(event: string, data: any): void {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  // Присоединить пользователя к комнате (например, чату)
  joinRoom(userId: number, room: string): void {
    const sockets = this.getUserSockets(userId);
    sockets.forEach(socket => {
      socket.join(room);
    });
  }

  // Удалить пользователя из комнаты
  leaveRoom(userId: number, room: string): void {
    const sockets = this.getUserSockets(userId);
    sockets.forEach(socket => {
      socket.leave(room);
    });
  }

  // Отправить событие в комнату
  sendToRoom(room: string, event: string, data: any): void {
    if (this.server) {
      this.server.to(room).emit(event, data);
    }
  }

  // Получить количество подключенных пользователей
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Получить общее количество соединений
  getTotalConnectionsCount(): number {
    let total = 0;
    for (const connections of this.connectedUsers.values()) {
      total += connections.length;
    }
    return total;
  }
}
