import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSourcetypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
