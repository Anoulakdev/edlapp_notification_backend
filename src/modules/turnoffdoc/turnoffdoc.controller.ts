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
  Sse,
  MessageEvent,
  Header,
} from '@nestjs/common';
import { TurnoffdocService } from './turnoffdoc.service';
import { CreateTurnoffdocDto } from './dto/create-turnoffdoc.dto';
import { UpdateTurnoffdocDto } from './dto/update-turnoffdoc.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Observable } from 'rxjs';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(FileInterceptor('turnoffFile', multerConfig('turnoff')))
@Controller('turnoffdocs')
export class TurnoffdocController {
  constructor(private readonly turnoffdocService: TurnoffdocService) {}

  @Post()
  @Roles(2, 3, 4, 5)
  create(
    @UploadedFile() turnoffFile: Express.Multer.File,
    @Req() req: UserRequest,
    @Body() createTurnoffdocDto: CreateTurnoffdocDto,
  ) {
    if (!turnoffFile) {
      throw new BadRequestException('turnoffFile is required');
    }

    const Docfilename = turnoffFile.filename;
    if (Docfilename) {
      createTurnoffdocDto.turnoffFile = Docfilename;
    }
    return this.turnoffdocService.create(
      createTurnoffdocDto,
      req.user,
      Docfilename,
    );
  }

  @Header('X-Accel-Buffering', 'no')
  @Header('Cache-Control', 'no-cache, no-transform')
  @Sse('sse')
  @Roles(2, 3, 4, 5)
  sse(): Observable<MessageEvent> {
    return this.turnoffdocService.getEventsObservable();
  }

  @Get()
  @Roles(2, 3, 4, 5)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('filterMyDocs') filterMyDocs?: string,
  ) {
    return this.turnoffdocService.findAll(req.user, {
      page,
      limit,
      search,
      startDate,
      endDate,
      provinceId,
      districtId,
      filterMyDocs: filterMyDocs === 'true' || filterMyDocs === '1',
    });
  }

  @Get(':id')
  @Roles(2, 3, 4, 5)
  findOne(@Param('id') id: string) {
    return this.turnoffdocService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4, 5)
  update(
    @Param('id') id: string,
    @UploadedFile() turnoffFile: Express.Multer.File,
    @Body() updateTurnoffdocDto: UpdateTurnoffdocDto,
  ) {
    if (turnoffFile) {
      updateTurnoffdocDto.turnoffFile = turnoffFile.filename;
    }
    return this.turnoffdocService.update(+id, updateTurnoffdocDto);
  }

  @Put('updateaddress/:id')
  @Roles(2, 3, 4, 5)
  updateAddress(
    @Param('id') id: string,
    @Body() updateTurnoffdocDto: UpdateTurnoffdocDto,
  ) {
    return this.turnoffdocService.updateAddress(+id, updateTurnoffdocDto);
  }

  @Delete(':id')
  @Roles(2, 3, 4, 5)
  remove(@Param('id') id: string) {
    return this.turnoffdocService.remove(+id);
  }
}
