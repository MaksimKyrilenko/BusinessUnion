import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { InvestmentsModule } from './investments/investments.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { EventsModule } from './events/events.module';
import { User } from './users/user.entity';
import { Profile } from './users/entities/profile.entity';
import { Project } from './projects/project.entity';
import { Investment } from './investments/investment.entity';
import { Chat } from './chat/entities/chat.entity';
import { Message } from './chat/entities/message.entity';
import { ChatUser } from './chat/entities/chat-user.entity';
import { Event } from './events/entities/event.entity';
import { FilesModule } from './files/files.module';
import { MessageModule } from './messages/message.module';
import { MarketAnalyticsModule } from './market-analytics/market-analytics.module';
import { EducationModule } from './education/education.module';
import { CommunitiesModule } from './communities/communities.module';
import { CryptoTrackerModule } from './crypto-tracker/crypto-tracker.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RedisModule } from './redis/redis.module';
import { MinioModule } from './minio/minio.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Временно включаем для автоматического создания таблиц
        logging: configService.get('DB_LOGGING') === 'true',
      }),
    }),
    RedisModule, // Глобальный модуль для публикации событий в WebSocket сервер
    MinioModule, // Глобальный модуль для работы с файлами в MinIO
    UsersModule,
    ProjectsModule,
    InvestmentsModule,
    AuthModule,
    ChatModule,
    EventsModule,
    FilesModule,
    MessageModule,
    MarketAnalyticsModule,
    EducationModule,
    CommunitiesModule,
    CryptoTrackerModule,
    DashboardModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
