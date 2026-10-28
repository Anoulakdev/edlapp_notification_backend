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
  Req,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipments')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @Roles(5)
  create(
    @Req() req: UserRequest,
    @Body() createEquipmentDto: CreateEquipmentDto,
  ) {
    return this.equipmentService.create(req.user, createEquipmentDto);
  }

  @Get()
  @Roles(5)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.equipmentService.findAll(req.user, {
      page,
      limit,
      search,
    });
  }

  @Get('selectequipment')
  selectEquipment(@Req() req: UserRequest) {
    return this.equipmentService.selectEquipment(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(+id);
  }

  @Put(':id')
  @Roles(5)
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @Put('updatestatus/:id')
  @Roles(5)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.equipmentService.updateStatus(+id, actived);
  }

  @Delete(':id')
  @Roles(5)
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(+id);
  }
}
