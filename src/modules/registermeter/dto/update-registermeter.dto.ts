import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistermeterDto } from './create-registermeter.dto';

export class UpdateRegistermeterDto extends PartialType(CreateRegistermeterDto) {}
