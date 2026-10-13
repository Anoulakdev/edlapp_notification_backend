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
import { TurnoffstatusService } from './turnoffstatus.service';
import { CreateTurnoffstatusDto } from './dto/create-turnoffstatus.dto';
import { UpdateTurnoffstatusDto } from './dto/update-turnoffstatus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('turnoffstatus')
export class TurnoffstatusController {
  constructor(private readonly turnoffstatusService: TurnoffstatusService) {}

  @Post()
  @Roles(1)
  create(@Body() createTurnoffstatusDto: CreateTurnoffstatusDto) {
    return this.turnoffstatusService.create(createTurnoffstatusDto);
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.turnoffstatusService.findAll();
  }

  @Get('selectturnoffstatus')
  selectTurnoffStatus() {
    return this.turnoffstatusService.selectTurnoffStatus();
  }

  @Get(':id')
  @Roles(1)
  findOne(@Param('id') id: string) {
    return this.turnoffstatusService.findOne(+id);
  }

  @Put(':id')
  @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateTurnoffstatusDto: UpdateTurnoffstatusDto,
  ) {
    return this.turnoffstatusService.update(+id, updateTurnoffstatusDto);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.turnoffstatusService.remove(+id);
  }
}
