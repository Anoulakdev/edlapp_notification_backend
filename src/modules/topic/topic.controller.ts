import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import type { UserRequest } from '../../interfaces/user-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @Roles(2, 3)
  create(@Req() req: UserRequest, @Body() createTopicDto: CreateTopicDto) {
    return this.topicService.create(req.user, createTopicDto);
  }

  @Get()
  @Roles(2, 3)
  findAll() {
    return this.topicService.findAll();
  }

  @Get('selecttopic')
  @Roles(2, 3)
  selectTopic() {
    return this.topicService.selectTopic();
  }

  @Get('edlapptopic')
  @Roles(6)
  edlappTopic(@Query('userAppId') userAppId: number) {
    return this.topicService.edlappTopic(userAppId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 3)
  update(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicService.update(req.user, +id, updateTopicDto);
  }

  @Put('updatestatus/:id')
  @Roles(2, 3)
  updateStatus(@Param('id') id: string, @Query('actived') actived: string) {
    return this.topicService.updateStatus(+id, actived);
  }

  @Delete(':id')
  @Roles(2, 3)
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id);
  }
}
