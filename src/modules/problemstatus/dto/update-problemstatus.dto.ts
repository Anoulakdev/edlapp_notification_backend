import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemstatusDto } from './create-problemstatus.dto';

export class UpdateProblemstatusDto extends PartialType(
  CreateProblemstatusDto,
) {}
