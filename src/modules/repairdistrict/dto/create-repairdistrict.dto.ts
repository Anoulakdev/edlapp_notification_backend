import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRepairdistrictDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;
}
