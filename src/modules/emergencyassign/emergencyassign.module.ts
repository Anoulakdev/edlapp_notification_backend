import { Module } from '@nestjs/common';
import { EmergencyassignService } from './emergencyassign.service';
import { EmergencyassignController } from './emergencyassign.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EmergencyassignController],
  providers: [EmergencyassignService, PrismaService],
})
export class EmergencyassignModule {}
