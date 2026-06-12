import { PartialType } from '@nestjs/mapped-types';
import { CreateEmergencydocDto } from './create-emergencydoc.dto';

export class UpdateEmergencydocDto extends PartialType(CreateEmergencydocDto) {}
