import { PartialType } from '@nestjs/mapped-types';
import { CreateTurnoffassignDto } from './create-turnoffassign.dto';

export class UpdateTurnoffassignDto extends PartialType(CreateTurnoffassignDto) {}
