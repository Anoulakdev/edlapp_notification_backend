import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmergencystatusService } from './emergencystatus.service';
import { CreateEmergencystatusDto } from './dto/create-emergencystatus.dto';
import { UpdateEmergencystatusDto } from './dto/update-emergencystatus.dto';

@Controller('emergencystatus')
export class EmergencystatusController {
  constructor(private readonly emergencystatusService: EmergencystatusService) {}

  @Post()
  create(@Body() createEmergencystatusDto: CreateEmergencystatusDto) {
    return this.emergencystatusService.create(createEmergencystatusDto);
  }

  @Get()
  findAll() {
    return this.emergencystatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emergencystatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmergencystatusDto: UpdateEmergencystatusDto) {
    return this.emergencystatusService.update(+id, updateEmergencystatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emergencystatusService.remove(+id);
  }
}
