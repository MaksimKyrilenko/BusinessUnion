import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Community } from './community.entity';
import { User } from '../../users/user.entity';

@Entity()
export class CommunityMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  communityId: number;

  @ManyToOne(() => Community, community => community.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @Column({ default: false })
  isModerator: boolean;

  @CreateDateColumn()
  joinedAt: Date;
}

