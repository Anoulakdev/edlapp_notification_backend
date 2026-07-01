import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createTopic } from './services/create';
import { findAllTopic } from './services/findall';
import { findOneTopic } from './services/findone';
import { updateTopic } from './services/update';
import { removeTopic } from './services/remove';
import { selectTopic } from './services/selectTopic';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}

  create(user: AuthUser, createTopicDto: CreateTopicDto) {
    return createTopic(this.prisma, user, createTopicDto);
  }

  findAll() {
    return findAllTopic(this.prisma);
  }

  selectTopic() {
    return selectTopic(this.prisma);
  }

  findOne(id: number) {
    return findOneTopic(this.prisma, id);
  }

  update(user: AuthUser, id: number, updateTopicDto: UpdateTopicDto) {
    return updateTopic(this.prisma, user, id, updateTopicDto);
  }

  updateStatus(id: number, actived: string) {
    return updateStatus(this.prisma, id, actived);
  }

  remove(id: number) {
    return removeTopic(this.prisma, id);
  }
}
