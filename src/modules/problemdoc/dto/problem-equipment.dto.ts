import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';

export class ProblemEquipmentItemDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  typeEquipmentId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  equipmentId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  typeUnitId: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export function transformProblemEquipments({
  value,
}: {
  value: unknown;
}): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
    parsed = [parsed];
  }
  if (Array.isArray(parsed)) {
    return plainToInstance(ProblemEquipmentItemDto, parsed);
  }
  return parsed;
}
