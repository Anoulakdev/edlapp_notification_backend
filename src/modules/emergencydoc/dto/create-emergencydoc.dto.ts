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
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  emergencyDate: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

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

  @IsString()
  @IsOptional()
  emergencyAudio?: string;

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
