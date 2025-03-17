import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;
}

class AdditionalInfoDto {
  @IsBoolean()
  @IsOptional()
  hasBusinessPlan?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTeam?: boolean;

  @IsBoolean()
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
  expectedRoi: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @IsObject()
  @ValidateNested()
  @Type(() => AdditionalInfoDto)
  @IsOptional()
  additionalInfo?: AdditionalInfoDto;
} 