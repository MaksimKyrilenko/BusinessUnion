import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { CryptoUpdatesService } from './crypto-updates.service';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';
import { CryptoTrackerModule } from '../crypto-tracker/crypto-tracker.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => ChatModule),
    forwardRef(() => UsersModule),
    forwardRef(() => CryptoTrackerModule),
  ],
  providers: [WebsocketGateway, WebsocketService, CryptoUpdatesService],
  exports: [WebsocketGateway, WebsocketService],
})
export class WebsocketModule {}
