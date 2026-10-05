import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEquipmentDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  typeEquipmentId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
