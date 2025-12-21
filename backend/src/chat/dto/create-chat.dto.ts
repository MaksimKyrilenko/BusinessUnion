import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatType } from '../enums/chat-type.enum';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsEnum(ChatType)
  type: ChatType;

  @IsArray()
  userIds: number[];
} 