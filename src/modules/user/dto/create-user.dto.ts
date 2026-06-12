import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsInt()
  @IsOptional()
  provinceId?: number;

  @IsInt()
  @IsOptional()
  districtId?: number;
}
