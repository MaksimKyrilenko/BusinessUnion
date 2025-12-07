import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Chat } from '../chat/entities/chat.entity';
import { Message } from '../chat/entities/message.entity';
import { ChatUser } from '../chat/entities/chat-user.entity';
import { Event } from '../events/entities/event.entity';
import { CommunityMember } from '../communities/entities/community-member.entity';
import { CommunityPost } from '../communities/entities/community-post.entity';
import { CommunityPostReaction } from '../communities/entities/community-post-reaction.entity';
import { EducationModule } from '../education/education.module';
import { MarketAnalyticsModule } from '../market-analytics/market-analytics.module';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Chat, Message, ChatUser, Event, CommunityMember, CommunityPost, CommunityPostReaction]),
    forwardRef(() => EducationModule),
    forwardRef(() => MarketAnalyticsModule),
    forwardRef(() => CommunitiesModule)
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {} 