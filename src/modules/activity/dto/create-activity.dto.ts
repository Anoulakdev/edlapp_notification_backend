import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  actFile?: string;
}
