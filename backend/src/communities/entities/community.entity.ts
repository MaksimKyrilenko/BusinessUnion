import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { CommunityPost } from './community-post.entity';
import { CommunityMember } from './community-member.entity';

@Entity()
export class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column()
  categoryId: number;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => CommunityPost, post => post.community)
  posts: CommunityPost[];

  @OneToMany(() => CommunityMember, member => member.community)
  members: CommunityMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

