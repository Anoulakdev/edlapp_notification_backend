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
import { TypeunitService } from './typeunit.service';
import { CreateTypeunitDto } from './dto/create-typeunit.dto';
import { UpdateTypeunitDto } from './dto/update-typeunit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('typeunits')
export class TypeunitController {
  constructor(private readonly typeunitService: TypeunitService) {}

  @Post()
  @Roles(2, 3, 4)
  create(@Body() createTypeunitDto: CreateTypeunitDto) {
    return this.typeunitService.create(createTypeunitDto);
  }

  @Get()
  @Roles(2, 3, 4)
  findAll() {
    return this.typeunitService.findAll();
  }

  @Get('selecttypeunit')
  selectTypeUnit() {
    return this.typeunitService.selectTypeUnit();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeunitService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4)
  update(
    @Param('id') id: string,
    @Body() updateTypeunitDto: UpdateTypeunitDto,
  ) {
    return this.typeunitService.update(+id, updateTypeunitDto);
  }

  @Put('updatestatus/:id')
  @Roles(2, 3, 4)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.typeunitService.updateStatus(+id, actived);
  }

  @Delete(':id')
  @Roles(2, 3, 4)
  remove(@Param('id') id: string) {
    return this.typeunitService.remove(+id);
  }
}
