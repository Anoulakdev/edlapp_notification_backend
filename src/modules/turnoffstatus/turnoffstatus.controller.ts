import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TurnoffstatusService } from './turnoffstatus.service';
import { CreateTurnoffstatusDto } from './dto/create-turnoffstatus.dto';
import { UpdateTurnoffstatusDto } from './dto/update-turnoffstatus.dto';

@Controller('turnoffstatus')
export class TurnoffstatusController {
  constructor(private readonly turnoffstatusService: TurnoffstatusService) {}

  @Post()
  create(@Body() createTurnoffstatusDto: CreateTurnoffstatusDto) {
    return this.turnoffstatusService.create(createTurnoffstatusDto);
  }

  @Get()
  findAll() {
    return this.turnoffstatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turnoffstatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTurnoffstatusDto: UpdateTurnoffstatusDto) {
    return this.turnoffstatusService.update(+id, updateTurnoffstatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.turnoffstatusService.remove(+id);
  }
}
