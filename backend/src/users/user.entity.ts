import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { UserType } from './enums/user-type.enum';
import { Profile } from './entities/profile.entity';
import { Project } from '../projects/project.entity';
import { Investment } from '../investments/investment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.STARTUP_FOUNDER
  })
  userType: UserType;

  @Column({ nullable: true, type: 'text' })
  interests?: string;

  // Email verification
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true, type: 'datetime' })
  emailVerificationExpires?: Date;

  // Password reset
  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true, type: 'datetime' })
  passwordResetExpires?: Date;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;

  @OneToMany(() => Project, project => project.author)
  projects: Project[];

  @OneToMany(() => Investment, investment => investment.investor)
  investments: Investment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}