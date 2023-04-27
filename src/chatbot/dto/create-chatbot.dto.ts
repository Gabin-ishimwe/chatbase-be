import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export enum FetchType {
  FILE = 'file',
  TEXT = 'text',
  WEBSITE = 'website',
}

export class CreateChatBot {
  @IsString()
  @IsNotEmpty()
  @IsEnum(FetchType)
  fetchType: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  data: string;

  @IsOptional()
  crawlLink: string;

  @IsOptional()
  siteMap: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches('^(https?|ftp)://[^s/$.?#].[^s]*$', undefined, { each: true })
  @Type(() => String)
  fetchSites: string[];
}
