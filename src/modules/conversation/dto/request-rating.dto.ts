import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestRatingDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  conversationId: number;
}
