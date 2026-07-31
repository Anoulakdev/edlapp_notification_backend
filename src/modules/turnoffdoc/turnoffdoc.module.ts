import { Module } from '@nestjs/common';
import { TurnoffdocService } from './turnoffdoc.service';
import { TurnoffdocController } from './turnoffdoc.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { TurnoffdocGateway } from './turnoffdoc.gateway';

@Module({
  controllers: [TurnoffdocController],
  providers: [TurnoffdocService, PrismaService, TurnoffdocGateway],
  exports: [TurnoffdocService, TurnoffdocGateway],
})
export class TurnoffdocModule {}
