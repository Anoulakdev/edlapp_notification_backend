import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemdocDto } from './create-problemdoc.dto';

export class UpdateProblemdocDto extends PartialType(CreateProblemdocDto) {}
