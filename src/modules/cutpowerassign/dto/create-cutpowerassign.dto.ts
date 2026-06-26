import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateCutpowerassignDto {
  @IsBoolean()
  @IsNotEmpty()
  docview: boolean;
}
