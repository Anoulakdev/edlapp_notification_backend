import { PartialType } from '@nestjs/mapped-types';
import { CreateSourcetypeDto } from './create-sourcetype.dto';

export class UpdateSourcetypeDto extends PartialType(CreateSourcetypeDto) {}
