import { Module } from '@nestjs/common';
import { VillageService } from './village.service';
import { VillageController } from './village.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [VillageController],
  providers: [VillageService, PrismaService],
})
export class VillageModule {}
