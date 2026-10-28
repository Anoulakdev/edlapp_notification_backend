import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  ProblemEquipmentItemDto,
  transformProblemEquipments,
} from './problem-equipment.dto';

export class CreateReceiverDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  problemId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  problemstatusId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  branchId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  repairDistrictId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parentProblemId?: number;

  @IsString()
  @IsOptional()
  commentText?: string;

  @IsString()
  @IsOptional()
  commentAudio?: string;

  @IsString()
  @IsOptional()
  commentImg?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  voltageId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  typeRepairId?: number;

  @Transform(({ value }) =>
    value === 'true' || value === true || value === 1 || value === '1'
      ? true
      : value === 'false' || value === false || value === 0 || value === '0'
        ? false
        : undefined,
  )
  @IsBoolean()
  @IsOptional()
  carRepair?: boolean;

  @IsOptional()
  @Transform(transformProblemEquipments)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProblemEquipmentItemDto)
  problemEquipments?: ProblemEquipmentItemDto[];

  @IsOptional()
  @Transform(transformProblemEquipments)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProblemEquipmentItemDto)
  equipments?: ProblemEquipmentItemDto[];
}
