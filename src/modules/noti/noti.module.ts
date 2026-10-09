import { Module } from '@nestjs/common';
import { NotiService } from './noti.service';
import { NotiController } from './noti.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [NotiController],
  providers: [NotiService, PrismaService],
})
export class NotiModule {}
