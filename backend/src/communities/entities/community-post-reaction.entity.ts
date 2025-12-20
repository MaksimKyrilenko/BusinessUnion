import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { User } from '../../users/user.entity';

@Entity()
@Unique(['postId', 'userId'])
export class CommunityPostReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @ManyToOne(() => CommunityPost, post => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: CommunityPost;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 'like' })
  type: string; // 'like', 'love', etc.

  @CreateDateColumn()
  createdAt: Date;
}

