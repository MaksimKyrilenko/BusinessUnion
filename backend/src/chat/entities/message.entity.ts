import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/user.entity';
import { MessageType } from '../enums/message-type.enum';
import { MessageStatus } from '../enums/message-status.enum';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Column({ nullable: true })
  replyToId: number;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToId' })
  replyTo: Message;

  @Column({ nullable: true })
  forwardedFromId: number;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'forwardedFromId' })
  forwardedFrom: Message;

  @Column()
  senderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  chatId: number;

  @ManyToOne(() => Chat, chat => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'simple-json', nullable: true })
  reactions: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 