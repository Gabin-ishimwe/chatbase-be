import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const urlRegex =
  /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+[a-zA-Z0-9_\/%=-]*(?:\?[a-zA-Z0-9_\/%=-]*)?(?:#[a-zA-Z0-9_-]*)?$/;

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
  description: string;

  @IsOptional()
  crawlLink: string;

  @IsOptional()
  siteMap: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // @Matches(
  //   '/^(https?://)?(www.)?([a-z0-9-]+.)*[a-z0-9-]+.[a-z]+(/[^s]*)?$/i',
  //   undefined,
  //   { each: true },
  // )
  @Type(() => String)
  fetchSites: string[];
}
