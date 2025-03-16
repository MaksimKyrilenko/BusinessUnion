// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../enums/user-type.enum';
import { CreateProfileDto } from './create-profile.dto';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(UserType)
    @IsOptional()
    userType?: UserType;

    @IsOptional()
    profile?: CreateProfileDto;
}