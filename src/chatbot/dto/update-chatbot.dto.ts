import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateChatBot } from './create-chatbot.dto';

export class UpdateChatBot extends OmitType(CreateChatBot, ['fetchType']) {
  @IsString()
  @IsOptional()
  botLink: string;

  @IsString()
  @IsOptional()
  model: string;

  @IsOptional()
  isPublic: string;

  @IsString()
  @IsOptional()
  theme: string;

  @IsString()
  @IsOptional()
  initialMessage: string;

  @IsString()
  @IsOptional()
  messageColor: string;

  @IsString()
  @IsOptional()
  displayName: string;
}
