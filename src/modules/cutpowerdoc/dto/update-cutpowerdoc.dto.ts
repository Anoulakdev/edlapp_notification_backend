import { PartialType } from '@nestjs/mapped-types';
import { CreateCutpowerdocDto } from './create-cutpowerdoc.dto';

export class UpdateCutpowerdocDto extends PartialType(CreateCutpowerdocDto) {}
