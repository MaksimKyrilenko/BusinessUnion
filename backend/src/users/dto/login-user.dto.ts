import { IsString, IsEmail, IsEnum } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsEnum(['startup_founder', 'investor', 'businessman', 'crypto_trader'])
    userType: string;
}