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
import { SourcetypeService } from './sourcetype.service';
import { CreateSourcetypeDto } from './dto/create-sourcetype.dto';
import { UpdateSourcetypeDto } from './dto/update-sourcetype.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sourcetypes')
export class SourcetypeController {
  constructor(private readonly sourcetypeService: SourcetypeService) {}

  @Post()
  @Roles(1)
  create(@Body() createSourcetypeDto: CreateSourcetypeDto) {
    return this.sourcetypeService.create(createSourcetypeDto);
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.sourcetypeService.findAll();
  }

  @Get('selectsource')
  selectSource() {
    return this.sourcetypeService.selectSource();
  }

  @Get(':id')
  @Roles(1)
  findOne(@Param('id') id: string) {
    return this.sourcetypeService.findOne(+id);
  }

  @Put(':id')
  @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateSourcetypeDto: UpdateSourcetypeDto,
  ) {
    return this.sourcetypeService.update(+id, updateSourcetypeDto);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.sourcetypeService.remove(+id);
  }
}
