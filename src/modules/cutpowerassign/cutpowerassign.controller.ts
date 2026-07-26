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
import { CutpowerassignService } from './cutpowerassign.service';
// import { CreateCutpowerassignDto } from './dto/create-cutpowerassign.dto';
import { UpdateCutpowerassignDto } from './dto/update-cutpowerassign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cutpowerassigns')
export class CutpowerassignController {
  constructor(private readonly cutpowerassignService: CutpowerassignService) {}

  @Get()
  @Roles(7)
  findAll(
    @Query('userAppId') userAppId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.cutpowerassignService.findAll(userAppId, page, limit);
  }

  @Get(':id')
  @Roles(7)
  findOne(@Param('id') id: string) {
    return this.cutpowerassignService.findOne(+id);
  }

  @Put(':id')
  @Roles(7)
  update(
    @Param('id') id: string,
    @Body() updateCutpowerassignDto: UpdateCutpowerassignDto,
  ) {
    return this.cutpowerassignService.update(+id, updateCutpowerassignDto);
  }
}
