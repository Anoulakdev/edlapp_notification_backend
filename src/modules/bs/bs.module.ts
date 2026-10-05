import { Module } from '@nestjs/common';
import { BsService } from './bs.service';
import { BsController } from './bs.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [BsController],
  providers: [BsService, PrismaService],
})
export class BsModule {}
