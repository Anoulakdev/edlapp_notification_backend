import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProblemstatusDto {
  @IsString()
  @IsNotEmpty()
  edlapp: string;

  @IsString()
  @IsNotEmpty()
  callcenter: string;
}
