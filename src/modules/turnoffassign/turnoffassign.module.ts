import { Module } from '@nestjs/common';
import { TurnoffassignService } from './turnoffassign.service';
import { TurnoffassignController } from './turnoffassign.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TurnoffassignController],
  providers: [TurnoffassignService, PrismaService],
})
export class TurnoffassignModule {}
