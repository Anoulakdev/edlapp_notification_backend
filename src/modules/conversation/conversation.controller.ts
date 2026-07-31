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
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { RequestRatingDto } from './dto/request-rating.dto';
import { CreateAgentRatingDto } from './dto/create-agent-rating.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  @Roles(7)
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

  @Post('callcreate')
  @Roles(2, 4)
  callCreate(
    @Req() req: UserRequest,
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
    return this.conversationService.callCreate(req.user, createConversationDto);
  }

  @Get('edlappget')
  @Roles(7)
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

  @Get('callget')
  @Roles(2, 4)
  callGet(
    @Query('externalUserId') externalUserId: number,
    @Query('topicId') topicId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.conversationService.callGet(
      externalUserId,
      topicId,
      page,
      limit,
    );
  }

  @Put(':id')
  updateMessage(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.updateMessage(+id, updateConversationDto);
  }

  @Get('topic/:topicId')
  @Roles(2, 4)
  listByTopic(@Param('topicId') topicId: string) {
    return this.conversationService.listByTopic(+topicId);
  }

  @Delete('clear/:conversationId')
  @Roles(2, 4, 7)
  clearChat(
    @Req() req: UserRequest,
    @Param('conversationId') conversationId: string,
  ) {
    return this.conversationService.clearChat(
      +conversationId,
      req.user?.roleId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }

  @Post('request-rating')
  @Roles(2, 4)
  requestRating(@Req() req: UserRequest, @Body() dto: RequestRatingDto) {
    return this.conversationService.requestRating(req.user, dto);
  }

  @Post('rate-agent')
  @Roles(7)
  createAgentRating(@Body() dto: CreateAgentRatingDto) {
    return this.conversationService.createAgentRating(dto);
  }

  @Get('rating/:conversationId')
  @Roles(2, 4, 7)
  getAgentRating(@Param('conversationId') conversationId: string) {
    return this.conversationService.getAgentRatingByConversation(
      +conversationId,
    );
  }
}
