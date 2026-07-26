import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageautoDto } from './create-messageauto.dto';

export class UpdateMessageautoDto extends PartialType(CreateMessageautoDto) {}
