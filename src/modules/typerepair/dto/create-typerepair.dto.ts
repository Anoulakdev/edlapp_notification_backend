import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTyperepairDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
