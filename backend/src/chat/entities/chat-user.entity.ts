import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/user.entity';
import { ChatUserRole } from '../enums/chat-user-role.enum';

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  chatId: number;

  @ManyToOne(() => Chat, chat => chat.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'enum', enum: ChatUserRole, default: ChatUserRole.MEMBER })
  role: ChatUserRole;

  @Column({ default: 0 })
  unreadCount: number;

  @Column({ default: false })
  isMuted: boolean;

  @CreateDateColumn()
  createdAt: Date;
} 