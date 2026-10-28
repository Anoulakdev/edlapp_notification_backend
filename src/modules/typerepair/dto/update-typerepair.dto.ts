import { PartialType } from '@nestjs/mapped-types';
import { CreateTyperepairDto } from './create-typerepair.dto';

export class UpdateTyperepairDto extends PartialType(CreateTyperepairDto) {}
