import { IsString, IsOptional, IsArray, IsNumber, Min, IsObject } from 'class-validator';
import { IProfile } from '../interfaces/profile.interface';
import { Type } from 'class-transformer';

export class UpdateProfileDto implements Partial<IProfile> {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    telegram?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  investmentSize?: number;
} 