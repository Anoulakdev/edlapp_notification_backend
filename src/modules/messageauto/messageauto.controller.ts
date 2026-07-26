import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MessageautoService } from './messageauto.service';
import { CreateMessageautoDto } from './dto/create-messageauto.dto';
import { UpdateMessageautoDto } from './dto/update-messageauto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messageautos')
export class MessageautoController {
  constructor(private readonly messageautoService: MessageautoService) {}

  @Post()
  @Roles(2, 4)
  create(@Body() createMessageautoDto: CreateMessageautoDto) {
    return this.messageautoService.create(createMessageautoDto);
  }

  @Get()
  @Roles(2, 4)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.messageautoService.findAll(page, limit);
  }

  @Get('selectmessageauto')
  selectMessageAuto(
    @Query('topicId') topicId?: number,
    @Query('search') search?: string,
  ) {
    return this.messageautoService.selectMessageAuto(topicId, search);
  }

  @Get(':id')
  @Roles(2, 4)
  findOne(@Param('id') id: string) {
    return this.messageautoService.findOne(+id);
  }

  @Put(':id')
  @Roles(2, 4)
  update(
    @Param('id') id: string,
    @Body() updateMessageautoDto: UpdateMessageautoDto,
  ) {
    return this.messageautoService.update(+id, updateMessageautoDto);
  }

  @Delete(':id')
  @Roles(2, 4)
  remove(@Param('id') id: string) {
    return this.messageautoService.remove(+id);
  }
}
