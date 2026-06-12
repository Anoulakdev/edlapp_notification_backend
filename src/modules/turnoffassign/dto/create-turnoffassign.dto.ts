import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateTurnoffassignDto {
  @IsBoolean()
  @IsNotEmpty()
  docview: boolean;
}
