import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmergencystatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
