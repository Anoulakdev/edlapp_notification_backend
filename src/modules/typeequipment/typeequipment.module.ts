import { Module } from '@nestjs/common';
import { TypeequipmentService } from './typeequipment.service';
import { TypeequipmentController } from './typeequipment.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TypeequipmentController],
  providers: [TypeequipmentService, PrismaService],
})
export class TypeequipmentModule {}
