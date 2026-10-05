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
import { VoltageService } from './voltage.service';
import { CreateVoltageDto } from './dto/create-voltage.dto';
import { UpdateVoltageDto } from './dto/update-voltage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('voltages')
export class VoltageController {
  constructor(private readonly voltageService: VoltageService) {}

  @Post()
  @Roles(2, 3, 4)
  create(@Body() createVoltageDto: CreateVoltageDto) {
    return this.voltageService.create(createVoltageDto);
  }

  @Get()
  @Roles(2, 3, 4)
  findAll() {
    return this.voltageService.findAll();
  }

  @Get('selectvoltage')
  selectVoltage() {
    return this.voltageService.selectVoltage();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voltageService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4)
  update(@Param('id') id: string, @Body() updateVoltageDto: UpdateVoltageDto) {
    return this.voltageService.update(+id, updateVoltageDto);
  }

  @Put('updatestatus/:id')
  @Roles(2, 3, 4)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.voltageService.updateStatus(+id, actived);
  }

  @Delete(':id')
  @Roles(2, 3, 4)
  remove(@Param('id') id: string) {
    return this.voltageService.remove(+id);
  }
}
