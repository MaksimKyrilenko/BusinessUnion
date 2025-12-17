import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface ConnectedUser {
visibleId: number;
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
    this.logger.log('Server instance set');
  }

  getServer(): Server {
    return this.server;
  }

  addUser(userId: number, socket: Socket): void {
    const userConnections = this.connectedUsers.get(userId) || [];
    userConnections.push({
      visibleId: userId,
      socketId: socket.id,
      socket,
      connectedAt: new Date(),
    });
    this.connectedUsers.set(userId, userConnections);
    this.logger.log(`[USER:ADD] User ${userId} connected. Socket: ${socket.id}. Total connections for user: ${userConnections.length}`);
  }

  removeUser(socketId: string): number | null {
    for (const [userId, connections] of this.connectedUsers.entries()) {
      const index = connections.findIndex(c => c.socketId === socketId);
      if (index !== -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.connectedUsers.delete(userId);
        }
        this.logger.log(`[USER:REMOVE] User ${userId} disconnected. Socket: ${socketId}`);
        return userId;
      }
    }
    return null;
  }

  isUserOnline(userId: number): boolean {
    const connections = this.connectedUsers.get(userId);
    return connections !== undefined && connections.length > 0;
  }

  getUserSockets(userId: number): Socket[] {
    const connections = this.connectedUsers.get(userId);
    return connections ? connections.map(c => c.socket) : [];
  }

  getOnlineUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  sendToUser(userId: number, event: string, data: any): void {
    const sockets = this.getUserSockets(userId);
    this.logger.log(`[SEND:USER] Sending ${event} to user ${userId} (${sockets.length} sockets)`);
    sockets.forEach(socket => {
      socket.emit(event, data);
    });
  }

  sendToUsers(userIds: number[], event: string, data: any): void {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }

  broadcast(event: string, data: any): void {
    if (this.server) {
      this.logger.log(`[BROADCAST] ${event}`);
      this.server.emit(event, data);
    }
  }

  sendToRoom(room: string, event: string, data: any): void {
    if (this.server) {
      const roomSockets = this.server.sockets.adapter.rooms.get(room);
      this.logger.log(`[SEND:ROOM] ${event} to ${room} (${roomSockets?.size || 0} clients)`);
      this.server.to(room).emit(event, data);
    }
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  getTotalConnectionsCount(): number {
    let total = 0;
    for (const connections of this.connectedUsers.values()) {
      total += connections.length;
    }
    return total;
  }

  getRoomClients(room: string): number {
    if (!this.server) return 0;
    const roomSockets = this.server.sockets.adapter.rooms.get(room);
    return roomSockets?.size || 0;
  }
}
