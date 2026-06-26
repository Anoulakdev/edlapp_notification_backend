import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMeterstatusDto {
  @IsString()
  @IsOptional()
  edlapp?: string;

  @IsString()
  @IsOptional()
  callcenter?: string;
}
