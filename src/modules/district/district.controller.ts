import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Query,
  // Delete,
  UseGuards,
} from '@nestjs/common';
import { DistrictService } from './district.service';
// import { CreateDistrictDto } from './dto/create-district.dto';
// import { UpdateDistrictDto } from './dto/update-district.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('districts')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Post()
  @Roles(1)
  create() {
    return this.districtService.create();
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.districtService.findAll();
  }

  @Get('selectdistrict')
  selectDistrict(@Query('provinceCode') provinceCode?: string) {
    return this.districtService.selectDistrict(provinceCode);
  }

  @Get(':id')
  @Roles(1)
  findOne(@Param('id') id: string) {
    return this.districtService.findOne(+id);
  }
}
