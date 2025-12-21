import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Project } from '../projects/project.entity';
import { Investment } from '../investments/investment.entity';
import { Community } from '../communities/entities/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Project, Investment, Community]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
