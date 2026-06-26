import { Module } from '@nestjs/common';
import { MeterstatusService } from './meterstatus.service';
import { MeterstatusController } from './meterstatus.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MeterstatusController],
  providers: [MeterstatusService, PrismaService],
})
export class MeterstatusModule {}
