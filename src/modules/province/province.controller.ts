import {
  Controller,
  Get,
  Post,
  // Body,
  // Patch,
  Param,
  // Delete,
  UseGuards,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
// import { CreateProvinceDto } from './dto/create-province.dto';
// import { UpdateProvinceDto } from './dto/update-province.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  @Roles(1)
  create() {
    return this.provinceService.create();
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.provinceService.findAll();
  }

  @Get('selectprovince')
  selectProvince() {
    return this.provinceService.selectProvince();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.provinceService.findOne(+id);
  }
}
