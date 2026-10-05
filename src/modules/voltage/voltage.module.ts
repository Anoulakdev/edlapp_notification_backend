import { Module } from '@nestjs/common';
import { VoltageService } from './voltage.service';
import { VoltageController } from './voltage.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [VoltageController],
  providers: [VoltageService, PrismaService],
})
export class VoltageModule {}
