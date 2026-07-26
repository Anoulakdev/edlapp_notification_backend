import { Module } from '@nestjs/common';
import { RepairdistrictService } from './repairdistrict.service';
import { RepairdistrictController } from './repairdistrict.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [RepairdistrictController],
  providers: [RepairdistrictService, PrismaService],
})
export class RepairdistrictModule {}
