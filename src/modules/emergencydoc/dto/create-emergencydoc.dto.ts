import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

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

  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;

  @IsString()
  @IsOptional()
  emergencyImg?: string;

  @IsInt()
  @IsOptional()
  provinceId?: number;

  @IsInt()
  @IsOptional()
  districtId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  villageId?: number[];
}
