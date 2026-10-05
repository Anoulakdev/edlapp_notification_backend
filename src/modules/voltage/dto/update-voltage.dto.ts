import { PartialType } from '@nestjs/mapped-types';
import { CreateVoltageDto } from './create-voltage.dto';

export class UpdateVoltageDto extends PartialType(CreateVoltageDto) {}
