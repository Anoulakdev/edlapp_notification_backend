import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(FileInterceptor('actFile', multerConfig('activity')))
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @Roles(8)
  create(
    @UploadedFile() actFile: Express.Multer.File,
    @Req() req: UserRequest,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    if (!actFile) {
      throw new BadRequestException('actFile is required');
    }

    const Docfilename = actFile.filename;
    if (Docfilename) {
      createActivityDto.actFile = Docfilename;
    }
    return this.activityService.create(
      createActivityDto,
      req.user,
      Docfilename,
    );
  }

  @Get()
  @Roles(7, 8)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityService.findAll(req.user, {
      page,
      limit,
      search,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @Roles(7, 8)
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Put(':id')
  @Roles(8)
  update(
    @Param('id') id: string,
    @UploadedFile() actFile: Express.Multer.File,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    if (actFile) {
      updateActivityDto.actFile = actFile.filename;
    }
    return this.activityService.update(+id, updateActivityDto);
  }

  @Delete(':id')
  @Roles(8)
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }
}
