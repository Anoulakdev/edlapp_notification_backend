import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EmergencystatusService } from './emergencystatus.service';
import { CreateEmergencystatusDto } from './dto/create-emergencystatus.dto';
import { UpdateEmergencystatusDto } from './dto/update-emergencystatus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('emergencystatus')
export class EmergencystatusController {
  constructor(
    private readonly emergencystatusService: EmergencystatusService,
  ) {}

  @Post()
  @Roles(1)
  create(@Body() createEmergencystatusDto: CreateEmergencystatusDto) {
    return this.emergencystatusService.create(createEmergencystatusDto);
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.emergencystatusService.findAll();
  }

  @Get('selectemergencystatus')
  selectEmergencyStatus() {
    return this.emergencystatusService.selectEmergencyStatus();
  }

  @Get(':id')
  @Roles(1)
  findOne(@Param('id') id: string) {
    return this.emergencystatusService.findOne(+id);
  }

  @Put(':id')
  @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateEmergencystatusDto: UpdateEmergencystatusDto,
  ) {
    return this.emergencystatusService.update(+id, updateEmergencystatusDto);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.emergencystatusService.remove(+id);
  }
}
