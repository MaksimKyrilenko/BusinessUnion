import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class Investment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  @ManyToOne(() => User, user => user.investments)
  investor: User;

  @ManyToOne(() => Project, project => project.investments)
  project: Project;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  actualRoi: number;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 