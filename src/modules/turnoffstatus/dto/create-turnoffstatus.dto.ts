import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTurnoffstatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
