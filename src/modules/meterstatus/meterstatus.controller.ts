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
import { MeterstatusService } from './meterstatus.service';
import { CreateMeterstatusDto } from './dto/create-meterstatus.dto';
import { UpdateMeterstatusDto } from './dto/update-meterstatus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meterstatues')
export class MeterstatusController {
  constructor(private readonly meterstatusService: MeterstatusService) {}

  @Post()
  @Roles(1)
  create(@Body() createMeterstatusDto: CreateMeterstatusDto) {
    return this.meterstatusService.create(createMeterstatusDto);
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.meterstatusService.findAll();
  }

  @Get(':id')
  @Roles(1)
  findOne(@Param('id') id: string) {
    return this.meterstatusService.findOne(+id);
  }

  @Put(':id')
  @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateMeterstatusDto: UpdateMeterstatusDto,
  ) {
    return this.meterstatusService.update(+id, updateMeterstatusDto);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.meterstatusService.remove(+id);
  }
}
