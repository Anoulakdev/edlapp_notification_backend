import { PartialType } from '@nestjs/mapped-types';
import { CreateTurnoffdocDto } from './create-turnoffdoc.dto';

export class UpdateTurnoffdocDto extends PartialType(CreateTurnoffdocDto) {}
