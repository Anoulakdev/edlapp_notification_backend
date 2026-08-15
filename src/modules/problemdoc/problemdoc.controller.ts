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
} from '@nestjs/common';
import { ProblemdocService } from './problemdoc.service';
import { CreateProblemdocDto } from './dto/create-problemdoc.dto';
import { UpdateProblemdocDto } from './dto/update-problemdoc.dto';
import { CreateReceiverDto } from './dto/create-receiver.dto';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('problemdocs')
export class ProblemdocController {
  constructor(private readonly problemdocService: ProblemdocService) {}

  @Post()
  @UseInterceptors(FileInterceptor('problemImg', multerConfig('problem')))
  @Roles(4, 7)
  create(
    @Req() req: UserRequest,
    @UploadedFile() problemImg: Express.Multer.File,
    @Body() createProblemdocDto: CreateProblemdocDto,
  ) {
    const Docfilename = problemImg?.filename;
    if (Docfilename) {
      createProblemdocDto.problemImg = Docfilename;
    }
    return this.problemdocService.create(
      req.user,
      createProblemdocDto,
      Docfilename,
    );
  }

  @Post('assign')
  @Roles(3)
  createAssign(
    @Req() req: UserRequest,
    @Body() createReceiverDto: CreateReceiverDto,
  ) {
    return this.problemdocService.createAssign(req.user, createReceiverDto);
  }

  @Get()
  @Roles(2, 3, 4, 5, 6)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('problemstatusId') problemstatusId?: number,
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
      problemstatusId,
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
  @Roles(7)
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
  findOne(@Param('id') id: string) {
    return this.problemdocService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('problemImg', multerConfig('problem')))
  @Roles(4, 7)
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

  @Put('updateassign/:id')
  @Roles(3)
  updateAssign(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateReceiverDto: UpdateReceiverDto,
  ) {
    return this.problemdocService.updateAssign(
      req.user,
      +id,
      updateReceiverDto,
    );
  }

  @Put('updatereceiver/:id')
  @Roles(6)
  updateReceiver(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateReceiverDto: UpdateReceiverDto,
  ) {
    return this.problemdocService.updateReceiver(
      req.user,
      +id,
      updateReceiverDto,
    );
  }

  @Put('updatestatus/:id')
  @Roles(3)
  updateStatus(
    @Param('id') id: string,
    @Body() updateReceiverDto: UpdateReceiverDto,
  ) {
    return this.problemdocService.updateStatus(+id, updateReceiverDto);
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
  @Roles(6)
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
  @Roles(4, 7)
  remove(@Param('id') id: string) {
    return this.problemdocService.remove(+id);
  }
}
