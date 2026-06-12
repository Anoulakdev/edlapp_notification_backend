import { Module } from '@nestjs/common';
import { EmergencydocService } from './emergencydoc.service';
import { EmergencydocController } from './emergencydoc.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EmergencydocController],
  providers: [EmergencydocService, PrismaService],
})
export class EmergencydocModule {}
