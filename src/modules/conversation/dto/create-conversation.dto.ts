import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConversationDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  externalUserId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  topicId: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  fileImg?: string;

  @IsString()
  @IsOptional()
  fileAudio?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lng?: number;
}
