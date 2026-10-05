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
  @Roles(2, 3, 4)
  create(
    @Req() req: UserRequest,
    @Body() createEquipmentDto: CreateEquipmentDto,
  ) {
    return this.equipmentService.create(req.user, createEquipmentDto);
  }

  @Get()
  @Roles(2, 3, 4)
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get('selectequipment')
  selectEquipment(@Query('typeEquipmentId') typeEquipmentId?: number) {
    return this.equipmentService.selectEquipment(typeEquipmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @Put('updatestatus/:id')
  @Roles(2, 3, 4)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.equipmentService.updateStatus(+id, actived);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(+id);
  }
}
