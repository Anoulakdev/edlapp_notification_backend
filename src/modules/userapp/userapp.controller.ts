import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserappService } from './userapp.service';
import { CreateUserappDto } from './dto/create-userapp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('userapp')
export class UserappController {
  constructor(private readonly userappService: UserappService) {}

  @Post()
  @Roles(11)
  create(@Body() createUserappDto: CreateUserappDto) {
    return this.userappService.create(createUserappDto);
  }

  @Get()
  @Roles(11)
  findAll(
    @Query('page') page?: string | number,
    @Query('limit') limit?: string | number,
    @Query('search') search?: string,
  ) {
    const pageNum =
      page !== undefined && !isNaN(Number(page))
        ? Math.max(1, Number(page))
        : 1;
    const limitNum =
      limit !== undefined && !isNaN(Number(limit))
        ? Math.min(100, Math.max(1, Number(limit)))
        : 10;

    return this.userappService.findAll(pageNum, limitNum, search);
  }

  @Put(':id')
  @Roles(11)
  update(@Param('id', ParseIntPipe) id: number) {
    return this.userappService.update(id);
  }
}
