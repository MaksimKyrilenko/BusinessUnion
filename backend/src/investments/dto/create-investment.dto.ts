import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateInvestmentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  projectId: number;

  @IsString()
  @IsOptional()
  comment?: string;
} 