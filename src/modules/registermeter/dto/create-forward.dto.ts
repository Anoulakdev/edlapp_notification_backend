import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateForwardDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  meterId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  meterStatusId: number;
}
