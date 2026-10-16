import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserappDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  phone_no: string;
}
