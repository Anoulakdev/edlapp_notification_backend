import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createActivity } from './services/create';
import { findAllActivity, findAllActivityOptions } from './services/findall';
import { findOneActivity } from './services/findone';
import { updateActivity } from './services/update';
import { removeActivity } from './services/remove';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  create(
    createActivityDto: CreateActivityDto,
    user: AuthUser,
    Docfilename: string,
  ) {
    return createActivity(this.prisma, user, createActivityDto, Docfilename);
  }

  findAll(user: AuthUser, options?: findAllActivityOptions) {
    return findAllActivity(this.prisma, user, options);
  }

  findOne(id: number) {
    return findOneActivity(this.prisma, id);
  }

  update(id: number, updateActivityDto: UpdateActivityDto) {
    return updateActivity(this.prisma, id, updateActivityDto);
  }

  remove(id: number) {
    return removeActivity(this.prisma, id);
  }
}
