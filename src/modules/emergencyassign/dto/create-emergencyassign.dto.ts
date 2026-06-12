import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateEmergencyassignDto {
  @IsBoolean()
  @IsNotEmpty()
  docview: boolean;
}
