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
import { TypeequipmentService } from './typeequipment.service';
import { CreateTypeequipmentDto } from './dto/create-typeequipment.dto';
import { UpdateTypeequipmentDto } from './dto/update-typeequipment.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('typeequipments')
export class TypeequipmentController {
  constructor(private readonly typeequipmentService: TypeequipmentService) {}

  @Post()
  @Roles(2, 3, 4)
  create(
    @Req() req: UserRequest,
    @Body() createTypeequipmentDto: CreateTypeequipmentDto,
  ) {
    return this.typeequipmentService.create(req.user, createTypeequipmentDto);
  }

  @Get()
  @Roles(2, 3, 4)
  findAll() {
    return this.typeequipmentService.findAll();
  }

  @Get('selecttypeequipment')
  selectTypeEquipment() {
    return this.typeequipmentService.selectTypeEquipment();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeequipmentService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4)
  update(
    @Param('id') id: string,
    @Body() updateTypeequipmentDto: UpdateTypeequipmentDto,
  ) {
    return this.typeequipmentService.update(+id, updateTypeequipmentDto);
  }

  @Put('updatestatus/:id')
  @Roles(2, 3, 4)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.typeequipmentService.updateStatus(+id, actived);
  }

  @Delete(':id')
  @Roles(2, 3, 4)
  remove(@Param('id') id: string) {
    return this.typeequipmentService.remove(+id);
  }
}
