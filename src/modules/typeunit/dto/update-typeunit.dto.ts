import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeunitDto } from './create-typeunit.dto';

export class UpdateTypeunitDto extends PartialType(CreateTypeunitDto) {}
