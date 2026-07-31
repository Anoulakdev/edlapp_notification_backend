import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAgentRatingDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  conversationId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  messageId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  agentId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
