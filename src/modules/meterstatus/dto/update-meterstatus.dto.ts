import { PartialType } from '@nestjs/mapped-types';
import { CreateMeterstatusDto } from './create-meterstatus.dto';

export class UpdateMeterstatusDto extends PartialType(CreateMeterstatusDto) {}
