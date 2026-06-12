import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TurnoffassignService } from './turnoffassign.service';
// import { CreateTurnoffassignDto } from './dto/create-turnoffassign.dto';
import { UpdateTurnoffassignDto } from './dto/update-turnoffassign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('turnoffassigns')
export class TurnoffassignController {
  constructor(private readonly turnoffassignService: TurnoffassignService) {}

  @Get()
  @Roles(6)
  findAll(@Query('userAppId') userAppId: number) {
    return this.turnoffassignService.findAll(userAppId);
  }

  @Get(':id')
  @Roles(6)
  findOne(@Param('id') id: string) {
    return this.turnoffassignService.findOne(+id);
  }

  @Put(':id')
  @Roles(6)
  update(
    @Param('id') id: string,
    @Body() updateTurnoffassignDto: UpdateTurnoffassignDto,
  ) {
    return this.turnoffassignService.update(+id, updateTurnoffassignDto);
  }
}
