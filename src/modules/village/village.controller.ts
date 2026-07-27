import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VillageService } from './village.service';
// import { CreateVillageDto } from './dto/create-village.dto';
// import { UpdateVillageDto } from './dto/update-village.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('villages')
export class VillageController {
  constructor(private readonly villageService: VillageService) {}

  @Post()
  create() {
    return this.villageService.create();
  }

  @Get()
  findAll() {
    return this.villageService.findAll();
  }

  @Get('selectvillage')
  selectVillage(@Query('districtCode') districtCode?: string) {
    return this.villageService.selectVillage(districtCode);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('edlworker')
  @Roles(6)
  edlWorkerVillage(@Req() req: UserRequest) {
    return this.villageService.edlWorkerVillage(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.villageService.findOne(+id);
  }
}
