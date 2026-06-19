import { PartialType } from '@nestjs/mapped-types';
import { CreateEmergencyassignDto } from './create-emergencyassign.dto';

export class UpdateEmergencyassignDto extends PartialType(
  CreateEmergencyassignDto,
) {}
