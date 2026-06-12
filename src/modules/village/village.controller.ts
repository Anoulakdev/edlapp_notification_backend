import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VillageService } from './village.service';
// import { CreateVillageDto } from './dto/create-village.dto';
// import { UpdateVillageDto } from './dto/update-village.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.villageService.findOne(+id);
  }
}
