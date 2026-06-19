import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProblemdocDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  problemtypeId: number;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  tel: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsString()
  @IsOptional()
  problemImg?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  provinceId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  districtId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  villageId?: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  sourcetypeId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  createdById: number;
}
