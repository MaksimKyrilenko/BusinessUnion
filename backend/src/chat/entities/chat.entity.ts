import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Message } from './message.entity';
import { ChatUser } from './chat-user.entity';
import { ChatType } from '../enums/chat-type.enum';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: ChatType, default: ChatType.PERSONAL })
  type: ChatType;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @OneToMany(() => ChatUser, chatUser => chatUser.chat)
  users: ChatUser[];

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 