import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCutpowerdocDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  cutpowerDate: string;

  @IsString()
  @IsOptional()
  cutpowerFile?: string;

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
