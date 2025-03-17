import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Profile } from './users/entities/profile.entity';
import { Project } from './projects/project.entity';
import { Investment } from './investments/investment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Подключаем поддержку .env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '1234',
      database: process.env.DB_NAME ?? 'union_db',
      entities: [User, Profile, Project, Investment],
      synchronize: true, // Временно включаем для создания таблиц
      migrationsRun: false,
    }),
    UsersModule,
    ProjectsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
