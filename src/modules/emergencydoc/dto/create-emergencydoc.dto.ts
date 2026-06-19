import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmergencydocDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  emergencyDate: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

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
  emergencyImg?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  provinceId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  districtId?: number;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  villageId?: number[];
}
