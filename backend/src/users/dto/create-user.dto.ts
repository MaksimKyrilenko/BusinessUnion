// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    firstName: string;

    @IsString()
    @MinLength(2)
    lastName: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(UserType)
    userType: UserType;

    @IsString()
    @IsOptional()
    interests?: string;
}