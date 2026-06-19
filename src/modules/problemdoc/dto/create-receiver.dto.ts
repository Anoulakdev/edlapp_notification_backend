import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceiverDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  problemId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  problemstatusId: number;

  @IsString()
  @IsOptional()
  commentText?: string;

  @IsString()
  @IsOptional()
  commentAudio?: string;

  @IsString()
  @IsOptional()
  commentImg?: string;
}
