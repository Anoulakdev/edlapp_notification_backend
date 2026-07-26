import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageautoDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  topicId: number;

  @IsString()
  @IsNotEmpty()
  messageTopic: string;
}
