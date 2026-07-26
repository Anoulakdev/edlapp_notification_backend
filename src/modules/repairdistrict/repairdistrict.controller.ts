import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { RepairdistrictService } from './repairdistrict.service';
import { CreateRepairdistrictDto } from './dto/create-repairdistrict.dto';
import { UpdateRepairdistrictDto } from './dto/update-repairdistrict.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('repairdistricts')
export class RepairdistrictController {
  constructor(private readonly repairdistrictService: RepairdistrictService) {}

  @Post()
  @Roles(2, 3, 4)
  create(
    @Req() req: UserRequest,
    @Body() createRepairdistrictDto: CreateRepairdistrictDto,
  ) {
    return this.repairdistrictService.create(req.user, createRepairdistrictDto);
  }

  @Get()
  @Roles(2, 3, 4)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.repairdistrictService.findAll(page, limit);
  }

  @Get('selectrepairdistrict')
  selectRepairDistrict(@Query('branchId') branchId?: number) {
    return this.repairdistrictService.selectRepairDistrict(branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repairdistrictService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4)
  update(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateRepairdistrictDto: UpdateRepairdistrictDto,
  ) {
    return this.repairdistrictService.update(
      req.user,
      +id,
      updateRepairdistrictDto,
    );
  }

  @Delete(':id')
  @Roles(2, 3, 4)
  remove(@Param('id') id: string) {
    return this.repairdistrictService.remove(+id);
  }
}
