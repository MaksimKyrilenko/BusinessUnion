import { Controller, Get } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { RedisService } from './redis.service';

@Controller()
export class HealthController {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly redisService: RedisService,
  ) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'websocket-server',
      timestamp: new Date().toISOString(),
      connections: this.websocketService.getTotalConnectionsCount(),
      onlineUsers: this.websocketService.getOnlineUsers().length,
      redis: await this.redisService.isConnected(),
    };
  }

  @Get('stats')
  getStats() {
    return {
      totalConnections: this.websocketService.getTotalConnectionsCount(),
      onlineUsers: this.websocketService.getOnlineUsers(),
      onlineUsersCount: this.websocketService.getOnlineUsers().length,
    };
  }
}
