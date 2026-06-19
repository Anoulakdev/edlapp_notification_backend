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
import { ProblemstatusService } from './problemstatus.service';
import { CreateProblemstatusDto } from './dto/create-problemstatus.dto';
import { UpdateProblemstatusDto } from './dto/update-problemstatus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('problemstatus')
export class ProblemstatusController {
  constructor(private readonly problemstatusService: ProblemstatusService) {}

  @Post()
  @Roles(1)
  create(@Body() createProblemstatusDto: CreateProblemstatusDto) {
    return this.problemstatusService.create(createProblemstatusDto);
  }

  @Get()
  @Roles(1)
  findAll() {
    return this.problemstatusService.findAll();
  }

  @Get(':id')
  @Roles(1)
  findOne(@Param('id') id: string) {
    return this.problemstatusService.findOne(+id);
  }

  @Put(':id')
  @Roles(1)
  update(
    @Param('id') id: string,
    @Body() updateProblemstatusDto: UpdateProblemstatusDto,
  ) {
    return this.problemstatusService.update(+id, updateProblemstatusDto);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id') id: string) {
    return this.problemstatusService.remove(+id);
  }
}
