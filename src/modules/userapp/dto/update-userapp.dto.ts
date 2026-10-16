import { PartialType } from '@nestjs/mapped-types';
import { CreateUserappDto } from './create-userapp.dto';

export class UpdateUserappDto extends PartialType(CreateUserappDto) {}
