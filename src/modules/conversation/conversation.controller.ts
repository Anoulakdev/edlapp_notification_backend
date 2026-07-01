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
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
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
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'fileImg', maxCount: 1 },
      { name: 'fileAudio', maxCount: 1 },
    ],
    multerConfig('conversation'),
  ),
)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('edlappcreate')
  @Roles(6)
  edlAppCreate(
    @UploadedFiles()
    files: {
      fileImg?: Express.Multer.File[];
      fileAudio?: Express.Multer.File[];
    },
    @Body() createConversationDto: CreateConversationDto,
  ) {
    if (files?.fileImg?.[0]) {
      createConversationDto.fileImg = files.fileImg[0].filename;
    }
    if (files?.fileAudio?.[0]) {
      createConversationDto.fileAudio = files.fileAudio[0].filename;
    }
    return this.conversationService.edlAppCreate(createConversationDto);
  }

  @Get('edlappget')
  @Roles(6)
  edlAppGet(
    @Query('externalUserId') externalUserId: number,
    @Query('topicId') topicId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.conversationService.edlAppGet(
      externalUserId,
      topicId,
      page,
      limit,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.conversationService.findOne(+id);
  // }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateConversationDto: UpdateConversationDto,
  // ) {
  //   return this.conversationService.update(+id, updateConversationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.conversationService.remove(+id);
  // }
}
