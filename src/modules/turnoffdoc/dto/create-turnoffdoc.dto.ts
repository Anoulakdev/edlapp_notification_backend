import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTurnoffdocDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsString()
  @IsOptional()
  turnoffFile?: string;

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
