import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    UsersModule,
    ProjectsModule,
    InvestmentsModule,
    AuthModule,
    ChatModule,
    EventsModule,
    FilesModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
