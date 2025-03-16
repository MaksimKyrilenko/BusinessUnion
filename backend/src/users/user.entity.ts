import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserType } from './enums/user-type.enum';
import { Profile } from './entities/profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.BUSINESSMAN
  })
  userType: UserType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  profile: Profile;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;
}