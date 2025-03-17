import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Investment } from '../investments/investment.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 15, scale: 2 })
  investmentNeeded: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  investmentCollected: number;

  @Column('decimal', { precision: 5, scale: 2 })
  expectedRoi: number;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'active' | 'completed' | 'cancelled';

  @Column('json', { nullable: true })
  category: {
    id: number;
    name: string;
  };

  @Column('json', { nullable: true })
  additionalInfo: {
    hasBusinessPlan: boolean;
    hasTeam: boolean;
    hasMVP: boolean;
  };

  @ManyToOne(() => User, user => user.projects)
  author: User;

  @OneToMany(() => Investment, investment => investment.project)
  investments: Investment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 