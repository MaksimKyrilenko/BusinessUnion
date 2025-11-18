import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsNumber()
  categoryId: number;
}

