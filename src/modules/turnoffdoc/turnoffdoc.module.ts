import { Module } from '@nestjs/common';
import { TurnoffdocService } from './turnoffdoc.service';
import { TurnoffdocController } from './turnoffdoc.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TurnoffdocController],
  providers: [TurnoffdocService, PrismaService],
})
export class TurnoffdocModule {}
