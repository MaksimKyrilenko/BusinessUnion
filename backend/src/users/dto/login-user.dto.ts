import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsEnum(['startup_founder', 'investor', 'businessman', 'crypto_trader'], { 
        message: 'Некорректный тип пользователя' 
    })
    userType?: string;
}