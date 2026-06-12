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
} from '@nestjs/common';
import { EmergencydocService } from './emergencydoc.service';
import { CreateEmergencydocDto } from './dto/create-emergencydoc.dto';
import { UpdateEmergencydocDto } from './dto/update-emergencydoc.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Observable } from 'rxjs';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(FileInterceptor('emergencyImg', multerConfig('emergency')))
@Controller('emergencydocs')
export class EmergencydocController {
  constructor(private readonly emergencydocService: EmergencydocService) {}

  @Post()
  @Roles(2, 3, 4, 5)
  create(
    @UploadedFile() emergencyImg: Express.Multer.File,
    @Req() req: UserRequest,
    @Body() createEmergencydocDto: CreateEmergencydocDto,
  ) {
    if (!emergencyImg) {
      throw new BadRequestException('emergencyImg is required');
    }

    const Docfilename = emergencyImg.filename;
    if (Docfilename) {
      createEmergencydocDto.emergencyImg = Docfilename;
    }
    return this.emergencydocService.create(
      createEmergencydocDto,
      req.user,
      Docfilename,
    );
  }

  @Sse('sse')
  @Roles(2, 3, 4, 5)
  sse(): Observable<MessageEvent> {
    return this.emergencydocService.getEventsObservable();
  }

  @Get()
  @Roles(2, 3, 4, 5)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('emergencyDate') emergencyDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('filterMyDocs') filterMyDocs?: string,
  ) {
    return this.emergencydocService.findAll(req.user, {
      page,
      limit,
      search,
      emergencyDate,
      provinceId,
      districtId,
      filterMyDocs: filterMyDocs === 'true' || filterMyDocs === '1',
    });
  }

  @Get(':id')
  @Roles(2, 3, 4, 5)
  findOne(@Param('id') id: string) {
    return this.emergencydocService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4, 5)
  update(
    @Param('id') id: string,
    @UploadedFile() emergencyImg: Express.Multer.File,
    @Body() updateEmergencydocDto: UpdateEmergencydocDto,
  ) {
    if (emergencyImg) {
      updateEmergencydocDto.emergencyImg = emergencyImg.filename;
    }
    return this.emergencydocService.update(+id, updateEmergencydocDto);
  }

  @Put('updateaddress/:id')
  @Roles(2, 3, 4, 5)
  updateAddress(
    @Param('id') id: string,
    @Body() updateEmergencydocDto: UpdateEmergencydocDto,
  ) {
    return this.emergencydocService.updateAddress(+id, updateEmergencydocDto);
  }

  @Delete(':id')
  @Roles(2, 3, 4, 5)
  remove(@Param('id') id: string) {
    return this.emergencydocService.remove(+id);
  }
}
