import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTypeunitDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
