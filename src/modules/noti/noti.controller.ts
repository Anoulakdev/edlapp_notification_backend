import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotiService } from './noti.service';
import { CreateNotiDto } from './dto/create-noti.dto';
import { UpdateNotiDto } from './dto/update-noti.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notis')
export class NotiController {
  constructor(private readonly notiService: NotiService) {}

  @Get()
  @Roles(7)
  findAll(@Query('userAppId') userAppId: number) {
    return this.notiService.findAll(userAppId);
  }

  @Get('getall')
  @Roles(7)
  getAll(
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('villageId') villageId?: number,
    @Query('typeNoti') typeNoti?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notiService.getAll(
      provinceId,
      districtId,
      villageId,
      typeNoti,
      page,
      limit,
    );
  }
}
