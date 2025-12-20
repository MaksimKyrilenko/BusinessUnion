import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCommunityPostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  image?: string;
}

