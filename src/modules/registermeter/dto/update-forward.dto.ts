import { PartialType } from '@nestjs/mapped-types';
import { CreateForwardDto } from './create-forward.dto';

export class UpdateForwardDto extends PartialType(CreateForwardDto) {}
