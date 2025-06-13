import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'json', nullable: true })
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    telegram?: string;
    vk?: string;
    instagram?: string;
    facebook?: string;
  };

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  completedDeals: number;

  @Column({ type: 'json', nullable: true })
  specialization: string[];

  @Column({ type: 'json', nullable: true })
  interests: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  investmentSize: number;

  @Column({ type: 'json', nullable: true })
  gallery: string[];
  
  @Column({ nullable: true })
  phoneNumber: string;
  
  @Column({ nullable: true })
  address: string;
  
  @Column({ nullable: true })
  region: string;
  
  @Column({ nullable: true })
  education: string;
  
  @Column({ type: 'json', nullable: true })
  certifications: string[];
  
  @Column({ type: 'json', nullable: true })
  languages: string[];

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 