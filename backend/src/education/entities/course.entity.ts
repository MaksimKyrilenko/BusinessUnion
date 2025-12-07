import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  externalId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  platform: string;

  @Column()
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column()
  duration: string;

  @Column()
  level: string;

  @Column()
  icon: string;

  @Column()
  color: string;

  @Column()
  category: string;

  @Column('json')
  features: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldPrice?: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
