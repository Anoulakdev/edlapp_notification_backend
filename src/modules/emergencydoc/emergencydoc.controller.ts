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
  UploadedFiles,
  UseGuards,
  Query,
  Sse,
  MessageEvent,
  Header,
} from '@nestjs/common';
import { EmergencydocService } from './emergencydoc.service';
import { CreateEmergencydocDto } from './dto/create-emergencydoc.dto';
import { UpdateEmergencydocDto } from './dto/update-emergencydoc.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Observable } from 'rxjs';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'emergencyImg', maxCount: 1 },
      { name: 'emergencyAudio', maxCount: 1 },
    ],
    multerConfig('emergency'),
  ),
)
@Controller('emergencydocs')
export class EmergencydocController {
  constructor(private readonly emergencydocService: EmergencydocService) {}

  @Post()
  @Roles(2, 4, 5, 6)
  create(
    @UploadedFiles()
    files: {
      emergencyImg?: Express.Multer.File[];
      emergencyAudio?: Express.Multer.File[];
    },
    @Req() req: UserRequest,
    @Body() createEmergencydocDto: CreateEmergencydocDto,
  ) {
    if (files?.emergencyImg?.[0]) {
      createEmergencydocDto.emergencyImg = files.emergencyImg[0].filename;
    }
    if (files?.emergencyAudio?.[0]) {
      createEmergencydocDto.emergencyAudio = files.emergencyAudio[0].filename;
    }
    return this.emergencydocService.create(createEmergencydocDto, req.user);
  }

  @Header('X-Accel-Buffering', 'no')
  @Header('Cache-Control', 'no-cache, no-transform')
  @Sse('sse')
  @Roles(2, 3, 4, 5, 6, 7)
  sse(): Observable<MessageEvent> {
    return this.emergencydocService.getEventsObservable();
  }

  @Get()
  @Roles(2, 3, 4, 5, 6, 7)
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
  @Roles(2, 3, 4, 5, 6, 7)
  findOne(@Param('id') id: string) {
    return this.emergencydocService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 4, 5, 6)
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      emergencyImg?: Express.Multer.File[];
      emergencyAudio?: Express.Multer.File[];
    },
    @Body() updateEmergencydocDto: UpdateEmergencydocDto,
  ) {
    if (files?.emergencyImg?.[0]) {
      updateEmergencydocDto.emergencyImg = files.emergencyImg[0].filename;
    }
    if (files?.emergencyAudio?.[0]) {
      updateEmergencydocDto.emergencyAudio = files.emergencyAudio[0].filename;
    }
    return this.emergencydocService.update(+id, updateEmergencydocDto);
  }

  @Put('updateaddress/:id')
  @Roles(2, 4, 5, 6)
  updateAddress(
    @Param('id') id: string,
    @Body() updateEmergencydocDto: UpdateEmergencydocDto,
  ) {
    return this.emergencydocService.updateAddress(+id, updateEmergencydocDto);
  }

  @Delete(':id')
  @Roles(2, 4, 5, 6)
  remove(@Param('id') id: string) {
    return this.emergencydocService.remove(+id);
  }
}
