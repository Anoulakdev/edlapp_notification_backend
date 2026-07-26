import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairdistrictDto } from './create-repairdistrict.dto';

export class UpdateRepairdistrictDto extends PartialType(CreateRepairdistrictDto) {}
