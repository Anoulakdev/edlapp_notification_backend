import {
  IsArray,
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

  @IsString()
  @IsOptional()
  commentText?: string;

  @IsString()
  @IsOptional()
  commentAudio?: string;

  @IsString()
  @IsOptional()
  commentImg?: string;

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
