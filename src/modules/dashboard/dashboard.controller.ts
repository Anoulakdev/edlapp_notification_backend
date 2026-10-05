import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('useronline')
  @Roles(1, 2, 3, 4)
  userOnline() {
    return this.dashboardService.userOnline();
  }

  @Get('userall')
  @Roles(1, 2, 3, 4)
  userAll() {
    return this.dashboardService.userAll();
  }

  @Get('dashall')
  @Roles(1, 2, 3, 4, 5, 6)
  dashAll(
    @Req() req: UserRequest,
    @Query('year') year: number,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
  ) {
    return this.dashboardService.dashAll(
      req.user,
      year,
      provinceId,
      districtId,
    );
  }
}
