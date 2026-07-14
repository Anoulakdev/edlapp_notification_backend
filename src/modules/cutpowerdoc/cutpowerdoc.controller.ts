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
import { CutpowerdocService } from './cutpowerdoc.service';
import { CreateCutpowerdocDto } from './dto/create-cutpowerdoc.dto';
import { UpdateCutpowerdocDto } from './dto/update-cutpowerdoc.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Observable } from 'rxjs';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(FileInterceptor('cutpowerFile', multerConfig('cutpower')))
@Controller('cutpowerdocs')
export class CutpowerdocController {
  constructor(private readonly cutpowerdocService: CutpowerdocService) {}

  @Post()
  @Roles(2, 3, 4, 5)
  create(
    @UploadedFile() cutpowerFile: Express.Multer.File,
    @Req() req: UserRequest,
    @Body() createCutpowerdocDto: CreateCutpowerdocDto,
  ) {
    if (!cutpowerFile) {
      throw new BadRequestException('cutpowerFile is required');
    }

    const Docfilename = cutpowerFile.filename;
    if (Docfilename) {
      createCutpowerdocDto.cutpowerFile = Docfilename;
    }
    return this.cutpowerdocService.create(
      createCutpowerdocDto,
      req.user,
      Docfilename,
    );
  }

  @Header('X-Accel-Buffering', 'no')
  @Header('Cache-Control', 'no-cache, no-transform')
  @Sse('sse')
  @Roles(2, 3, 4, 5)
  sse(): Observable<MessageEvent> {
    return this.cutpowerdocService.getEventsObservable();
  }

  @Get()
  @Roles(2, 3, 4, 5)
  findAll(
    @Req() req: UserRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('cutpowerDate') cutpowerDate?: string,
    @Query('provinceId') provinceId?: number,
    @Query('districtId') districtId?: number,
    @Query('filterMyDocs') filterMyDocs?: string,
  ) {
    return this.cutpowerdocService.findAll(req.user, {
      page,
      limit,
      search,
      cutpowerDate,
      provinceId,
      districtId,
      filterMyDocs: filterMyDocs === 'true' || filterMyDocs === '1',
    });
  }

  @Get(':id')
  @Roles(2, 3, 4, 5)
  findOne(@Param('id') id: string) {
    return this.cutpowerdocService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3, 4, 5)
  update(
    @Param('id') id: string,
    @UploadedFile() cutpowerFile: Express.Multer.File,
    @Body() updateCutpowerdocDto: UpdateCutpowerdocDto,
  ) {
    if (cutpowerFile) {
      updateCutpowerdocDto.cutpowerFile = cutpowerFile.filename;
    }
    return this.cutpowerdocService.update(+id, updateCutpowerdocDto);
  }

  @Put('updateaddress/:id')
  @Roles(2, 3, 4, 5)
  updateAddress(
    @Param('id') id: string,
    @Body() updateCutpowerdocDto: UpdateCutpowerdocDto,
  ) {
    return this.cutpowerdocService.updateAddress(+id, updateCutpowerdocDto);
  }

  @Delete(':id')
  @Roles(2, 3, 4, 5)
  remove(@Param('id') id: string) {
    return this.cutpowerdocService.remove(+id);
  }
}
