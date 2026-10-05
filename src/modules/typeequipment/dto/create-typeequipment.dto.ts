import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeequipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;
}
