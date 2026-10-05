import { PartialType } from '@nestjs/mapped-types';
import { CreateBDto } from './create-b.dto';

export class UpdateBDto extends PartialType(CreateBDto) {}
