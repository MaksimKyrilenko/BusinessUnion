import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, IsEnum, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;
}

class AdditionalInfoDto {
  @IsOptional()
  @IsString()
  teamSize?: string;

  @IsOptional()
  @IsString()
  foundedAt?: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  hasTeam?: boolean;

  @IsOptional()
  hasMVP?: boolean;
}

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  investmentNeeded: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minInvestment?: number;

  @IsNumber()
  @Min(0)
  expectedRoi: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => AdditionalInfoDto)
  @IsOptional()
  additionalInfo?: AdditionalInfoDto;

  @IsString()
  @IsOptional()
  businessPlanUrl?: string;

  @IsString()
  @IsOptional()
  presentationUrl?: string;
} 