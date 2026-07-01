import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { edlAppCreate } from './services/edlappCreate';
import { edlAppGet } from './services/edlappGet';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  edlAppCreate(createConversationDto: CreateConversationDto) {
    return edlAppCreate(this.prisma, createConversationDto);
  }

  edlAppGet(externalUserId: number, topicId: number, page?: number, limit?: number) {
    return edlAppGet(this.prisma, Number(externalUserId), Number(topicId), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} conversation`;
  // }

  // update(id: number, updateConversationDto: UpdateConversationDto) {
  //   return `This action updates a #${id} conversation`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} conversation`;
  // }
}
