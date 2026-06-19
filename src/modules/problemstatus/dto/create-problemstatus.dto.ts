import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProblemstatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
