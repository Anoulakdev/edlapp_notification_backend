import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BsService } from './bs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bs')
export class BsController {
  constructor(private readonly bsService: BsService) {}

  @Get()
  @Roles(2, 3, 4)
  findAll(
    @Query('provinceId') provinceId: number,
    @Query('accountNo') accountNo: string,
    @Query('start_year') start_year: string,
    @Query('end_year') end_year: string,
  ) {
    return this.bsService.findAll(provinceId, accountNo, start_year, end_year);
  }
}
