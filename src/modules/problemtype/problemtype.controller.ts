import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProblemtypeService } from './problemtype.service';
import { CreateProblemtypeDto } from './dto/create-problemtype.dto';
import { UpdateProblemtypeDto } from './dto/update-problemtype.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('problemtypes')
export class ProblemtypeController {
  constructor(private readonly problemtypeService: ProblemtypeService) {}

  @Post()
  @Roles(2, 3)
  create(
    @Req() req: UserRequest,
    @Body() createProblemtypeDto: CreateProblemtypeDto,
  ) {
    return this.problemtypeService.create(req.user, createProblemtypeDto);
  }

  @Get()
  @Roles(2, 3)
  findAll() {
    return this.problemtypeService.findAll();
  }

  @Get('selectproblemtype')
  selectProblemType() {
    return this.problemtypeService.selectProblemType();
  }

  @Get(':id')
  @Roles(2, 3)
  findOne(@Param('id') id: string) {
    return this.problemtypeService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3)
  update(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateProblemtypeDto: UpdateProblemtypeDto,
  ) {
    return this.problemtypeService.update(req.user, +id, updateProblemtypeDto);
  }

  @Delete(':id')
  @Roles(2, 3)
  remove(@Param('id') id: string) {
    return this.problemtypeService.remove(+id);
  }
}
