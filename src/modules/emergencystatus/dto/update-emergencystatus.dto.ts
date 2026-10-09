import { PartialType } from '@nestjs/mapped-types';
import { CreateEmergencystatusDto } from './create-emergencystatus.dto';

export class UpdateEmergencystatusDto extends PartialType(CreateEmergencystatusDto) {}
