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
} from '@nestjs/common';
import { RegistermeterService } from './registermeter.service';
import { CreateRegistermeterDto } from './dto/create-registermeter.dto';
import { CreateForwardDto } from './dto/create-forward.dto';
import { UpdateRegistermeterDto } from './dto/update-registermeter.dto';
import { UpdateForwardDto } from './dto/update-forward.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Observable } from 'rxjs';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'billNearImg', maxCount: 1 },
      { name: 'idcardImg', maxCount: 1 },
    ],
    multerConfig('registermeter'),
  ),
)
@Controller('registermeters')
export class RegistermeterController {
  constructor(private readonly registermeterService: RegistermeterService) {}

  @Post()
  @Roles(2, 3, 6)
  create(
    @Req() req: UserRequest,
    @UploadedFiles()
    files: {
      billNearImg?: Express.Multer.File[];
      idcardImg?: Express.Multer.File[];
    },
    @Body() createRegistermeterDto: CreateRegistermeterDto,
  ) {
    if (files?.billNearImg?.[0]) {
      createRegistermeterDto.billNearImg = files.billNearImg[0].filename;
    }
    if (files?.idcardImg?.[0]) {
      createRegistermeterDto.idcardImg = files.idcardImg[0].filename;
    }
    return this.registermeterService.create(req.user, createRegistermeterDto);
  }

  @Post('createforward')
  @Roles(2, 3)
  createForward(
    @Req() req: UserRequest,
    @Body() createForwardDto: CreateForwardDto,
  ) {
    return this.registermeterService.createForward(req.user, createForwardDto);
  }

  @Sse('sse')
  @Roles(2, 3, 4, 5)
  sse(): Observable<MessageEvent> {
    return this.registermeterService.getEventsObservable();
  }

  @Get()
  @Roles(2, 3, 4, 5)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('meterStatusId') meterStatusId?: number,
    @Query('sourcetypeId') sourcetypeId?: number,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('villageId') villageId?: number,
    @Query('filterMyDocs') filterMyDocs?: string,
  ) {
    return this.registermeterService.findAll(req.user, {
      page,
      limit,
      search,
      meterStatusId,
      sourcetypeId,
      provinceId,
      districtId,
      villageId,
      filterMyDocs: filterMyDocs === 'true' || filterMyDocs === '1',
    });
  }

  @Get('edlapp')
  @Roles(6)
  EDLAPP(
    @Query('userAppId') userAppId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('meterStatusId') meterStatusId?: number,
  ) {
    return this.registermeterService.EDLAPP(userAppId, {
      page,
      limit,
      meterStatusId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registermeterService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 6)
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      billNearImg?: Express.Multer.File[];
      idcardImg?: Express.Multer.File[];
    },
    @Body() updateRegistermeterDto: UpdateRegistermeterDto,
  ) {
    if (files?.billNearImg?.[0]) {
      updateRegistermeterDto.billNearImg = files.billNearImg[0].filename;
    }
    if (files?.idcardImg?.[0]) {
      updateRegistermeterDto.idcardImg = files.idcardImg[0].filename;
    }
    return this.registermeterService.update(+id, updateRegistermeterDto);
  }

  @Put('updateforward/:id')
  @Roles(4)
  updateForward(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateForwardDto: UpdateForwardDto,
  ) {
    return this.registermeterService.updateForward(
      req.user,
      +id,
      updateForwardDto,
    );
  }

  @Delete(':id')
  @Roles(2, 3, 6)
  remove(@Param('id') id: string) {
    return this.registermeterService.remove(+id);
  }
}
