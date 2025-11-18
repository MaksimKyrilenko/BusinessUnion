import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Community } from './community.entity';
import { User } from '../../users/user.entity';

@Entity()
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  communityId: number;

  @ManyToOne(() => Community, community => community.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

