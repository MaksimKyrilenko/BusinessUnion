import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Токен верификации email' })
  @IsString()
  @IsNotEmpty({ message: 'Токен обязателен' })
  token: string;
}
