import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
