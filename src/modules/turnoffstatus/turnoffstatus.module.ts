import { Module } from '@nestjs/common';
import { TurnoffstatusService } from './turnoffstatus.service';
import { TurnoffstatusController } from './turnoffstatus.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TurnoffstatusController],
  providers: [TurnoffstatusService, PrismaService],
})
export class TurnoffstatusModule {}
