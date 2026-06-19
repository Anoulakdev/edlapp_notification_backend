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
import { ProblemdocService } from './problemdoc.service';
import { CreateProblemdocDto } from './dto/create-problemdoc.dto';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateProblemdocDto } from './dto/update-problemdoc.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';
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
@Controller('problemdocs')
export class ProblemdocController {
  constructor(private readonly problemdocService: ProblemdocService) {}

  @Post()
  @UseInterceptors(FileInterceptor('problemImg', multerConfig('problem')))
  @Roles(2, 3, 6)
  create(
    @UploadedFile() problemImg: Express.Multer.File,
    @Body() createProblemdocDto: CreateProblemdocDto,
  ) {
    const Docfilename = problemImg?.filename;
    if (Docfilename) {
      createProblemdocDto.problemImg = Docfilename;
    }
    return this.problemdocService.create(createProblemdocDto, Docfilename);
  }

  @Post('receiver')
  @Roles(5)
  createReceiver(
    @Req() req: UserRequest,
    @Body() createReceiverDto: CreateReceiverDto,
  ) {
    return this.problemdocService.createReceiver(req.user, createReceiverDto);
  }

  @Sse('sse')
  @Roles(2, 3, 4, 5)
  sse(): Observable<MessageEvent> {
    return this.problemdocService.getEventsObservable();
  }

  @Get()
  @Roles(2, 3, 4, 5, 6)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('problemtypeId') problemtypeId?: number,
    @Query('sourcetypeId') sourcetypeId?: number,
    @Query('problemDate') problemDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('villageId') villageId?: number,
    @Query('filterMyDocs') filterMyDocs?: string,
  ) {
    return this.problemdocService.findAll(req.user, {
      page,
      limit,
      search,
      problemtypeId,
      sourcetypeId,
      problemDate,
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
    @Query('problemstatusId') problemstatusId?: number,
  ) {
    return this.problemdocService.EDLAPP(userAppId, {
      page,
      limit,
      problemstatusId,
    });
  }

  @Get(':id')
  @Roles(2, 3, 4, 5, 6)
  findOne(@Param('id') id: string) {
    return this.problemdocService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('problemImg', multerConfig('problem')))
  @Roles(2, 3, 6)
  update(
    @Param('id') id: string,
    @UploadedFile() problemImg: Express.Multer.File,
    @Body() updateProblemdocDto: UpdateProblemdocDto,
  ) {
    if (problemImg) {
      updateProblemdocDto.problemImg = problemImg.filename;
    }
    return this.problemdocService.update(+id, updateProblemdocDto);
  }

  @Put('repair/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'commentAudio', maxCount: 1 },
        { name: 'commentImg', maxCount: 1 },
      ],
      multerConfig(),
    ),
  )
  @Roles(5)
  updateRepair(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      commentAudio?: Express.Multer.File[];
      commentImg?: Express.Multer.File[];
    },
    @Body() updateReceiverDto: UpdateReceiverDto,
  ) {
    if (files?.commentAudio?.[0]) {
      updateReceiverDto.commentAudio = files.commentAudio[0].filename;
    }
    if (files?.commentImg?.[0]) {
      updateReceiverDto.commentImg = files.commentImg[0].filename;
    }
    return this.problemdocService.updateRepair(
      req.user,
      +id,
      updateReceiverDto,
    );
  }

  @Delete(':id')
  @Roles(2, 3, 6)
  remove(@Param('id') id: string) {
    return this.problemdocService.remove(+id);
  }
}
