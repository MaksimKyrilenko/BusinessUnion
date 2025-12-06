import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Investment } from '../investments/investment.entity';
import { ProjectTeamMember } from './entities/project-team-member.entity';

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

  @Column('longtext', { nullable: true })
  image: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'active' | 'completed' | 'cancelled';

  @Column('json', { nullable: true })
  category: {
    id: number;
    name: string;
  };

  @Column({ nullable: true })
  categoryId: number;

  @Column({ default: 'idea' })
  stage: 'idea' | 'mvp' | 'growth' | 'scaling';

  @Column({ nullable: true })
  location: string;

  @Column('json', { nullable: true })
  additionalInfo: {
    hasBusinessPlan: boolean;
    hasTeam: boolean;
    hasMVP: boolean;
    teamSize?: number;
    foundedAt?: string;
  };

  @Column({ nullable: true })
  businessPlanUrl: string;
  
  @Column({ nullable: true })
  presentationUrl: string;

  @ManyToOne(() => User, user => user.projects)
  author: User;

  @OneToMany(() => Investment, investment => investment.project)
  investments: Investment[];

  @OneToMany(() => ProjectTeamMember, teamMember => teamMember.project)
  teamMembers: ProjectTeamMember[];

  @Column({ nullable: true })
  teamChatId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 