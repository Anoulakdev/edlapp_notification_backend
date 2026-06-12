import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EmergencyassignService } from './emergencyassign.service';
import { CreateEmergencyassignDto } from './dto/create-emergencyassign.dto';
import { UpdateEmergencyassignDto } from './dto/update-emergencyassign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('emergencyassigns')
export class EmergencyassignController {
  constructor(
    private readonly emergencyassignService: EmergencyassignService,
  ) {}

  @Get()
  @Roles(6)
  findAll(@Query('userAppId') userAppId: number) {
    return this.emergencyassignService.findAll(userAppId);
  }

  @Get(':id')
  @Roles(6)
  findOne(@Param('id') id: string) {
    return this.emergencyassignService.findOne(+id);
  }

  @Put(':id')
  @Roles(6)
  update(
    @Param('id') id: string,
    @Body() updateEmergencyassignDto: UpdateEmergencyassignDto,
  ) {
    return this.emergencyassignService.update(+id, updateEmergencyassignDto);
  }
}
