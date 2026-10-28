import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TyperepairService } from './typerepair.service';
import { CreateTyperepairDto } from './dto/create-typerepair.dto';
import { UpdateTyperepairDto } from './dto/update-typerepair.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('typerepairs')
export class TyperepairController {
  constructor(private readonly typerepairService: TyperepairService) {}

  @Post()
  @Roles(1)
  create(@Body() createTyperepairDto: CreateTyperepairDto) {
    return this.typerepairService.create(createTyperepairDto);
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.typerepairService.findAll();
  }

  @Get('selecttyperepair')
  selectTypeRepair() {
    return this.typerepairService.selectTypeRepair();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typerepairService.findOne(+id);
  }

  @Put(':id')
  @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateTyperepairDto: UpdateTyperepairDto,
  ) {
    return this.typerepairService.update(+id, updateTyperepairDto);
  }

  @Put('updatestatus/:id')
  @Roles(1)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.typerepairService.updateStatus(+id, actived);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.typerepairService.remove(+id);
  }
}
