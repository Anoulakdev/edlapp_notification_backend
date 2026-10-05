import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeequipmentDto } from './create-typeequipment.dto';

export class UpdateTypeequipmentDto extends PartialType(CreateTypeequipmentDto) {}
