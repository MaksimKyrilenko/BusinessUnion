import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from '../project.entity';
import { User } from '../../users/user.entity';
import { ProjectTeamRole } from '../enums/project-team-role.enum';

@Entity()
export class ProjectTeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @ManyToOne(() => Project, project => project.teamMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ProjectTeamRole, default: ProjectTeamRole.MEMBER })
  role: ProjectTeamRole;

  @CreateDateColumn()
  joinedAt: Date;
}

