import { Injectable } from '@nestjs/common';
import { CreateMessageautoDto } from './dto/create-messageauto.dto';
import { UpdateMessageautoDto } from './dto/update-messageauto.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createMessageAuto } from './services/create';
import { findAllMessageAuto } from './services/findall';
import { findOneMessageAuto } from './services/findone';
import { removeMessageAuto } from './services/remove';
import { updateMessageAuto } from './services/update';
import { selectMessageAuto } from './services/selectMessageAuto';

@Injectable()
export class MessageautoService {
  constructor(private prisma: PrismaService) {}

  create(createMessageautoDto: CreateMessageautoDto) {
    return createMessageAuto(this.prisma, createMessageautoDto);
  }

  findAll(page?: number, limit?: number) {
    return findAllMessageAuto(this.prisma, page, limit);
  }

  selectMessageAuto(topicId?: number, search?: string) {
    return selectMessageAuto(this.prisma, topicId, search);
  }

  findOne(id: number) {
    return findOneMessageAuto(this.prisma, id);
  }

  update(id: number, updateMessageautoDto: UpdateMessageautoDto) {
    return updateMessageAuto(this.prisma, id, updateMessageautoDto);
  }

  remove(id: number) {
    return removeMessageAuto(this.prisma, id);
  }
}
