import { PartialType } from '@nestjs/mapped-types';
import { CreateCutpowerassignDto } from './create-cutpowerassign.dto';

export class UpdateCutpowerassignDto extends PartialType(CreateCutpowerassignDto) {}
