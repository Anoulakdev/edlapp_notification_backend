import { PartialType } from '@nestjs/mapped-types';
import { CreateTurnoffstatusDto } from './create-turnoffstatus.dto';

export class UpdateTurnoffstatusDto extends PartialType(CreateTurnoffstatusDto) {}
