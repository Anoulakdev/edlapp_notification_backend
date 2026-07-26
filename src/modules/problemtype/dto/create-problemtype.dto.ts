import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProblemtypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;
}
