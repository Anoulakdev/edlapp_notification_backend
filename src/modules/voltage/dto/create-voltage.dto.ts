import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVoltageDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
