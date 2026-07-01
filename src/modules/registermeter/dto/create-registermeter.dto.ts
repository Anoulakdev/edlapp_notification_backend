import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegistermeterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  accountNear: string;

  @IsString()
  @IsOptional()
  billNearImg?: string;

  @IsString()
  @IsOptional()
  idcardImg?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lng?: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  provinceId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  districtId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  villageId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  createdById?: number;
}
