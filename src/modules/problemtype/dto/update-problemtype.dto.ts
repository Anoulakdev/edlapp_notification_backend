import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemtypeDto } from './create-problemtype.dto';

export class UpdateProblemtypeDto extends PartialType(CreateProblemtypeDto) {}
