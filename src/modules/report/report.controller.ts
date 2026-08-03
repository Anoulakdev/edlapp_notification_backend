import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('turnoff')
  @Roles(2, 3, 4, 5, 6)
  turnoffReport(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
  ) {
    return this.reportService.turnoffReport(req.user, {
      page,
      limit,
      startDate,
      endDate,
      provinceId,
      districtId,
    });
  }

  @Get('emergency')
  @Roles(2, 3, 4, 5, 6)
  emergencyReport(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
  ) {
    return this.reportService.emergencyReport(req.user, {
      page,
      limit,
      startDate,
      endDate,
      provinceId,
      districtId,
    });
  }

  @Get('cutpower')
  @Roles(2, 3, 4, 5, 6)
  cutpowerReport(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
  ) {
    return this.reportService.cutpowerReport(req.user, {
      page,
      limit,
      startDate,
      endDate,
      provinceId,
      districtId,
    });
  }

  @Get('registermeter')
  @Roles(2, 3, 4, 5, 6)
  registermeterReport(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('meterStatusId') meterStatusId?: number,
    @Query('sourcetypeId') sourcetypeId?: number,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('villageId') villageId?: number,
  ) {
    return this.reportService.registermeterReport(req.user, {
      page,
      limit,
      startDate,
      endDate,
      meterStatusId,
      sourcetypeId,
      provinceId,
      districtId,
      villageId,
    });
  }
}
