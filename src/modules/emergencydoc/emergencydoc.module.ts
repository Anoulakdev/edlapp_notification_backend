import { Module } from '@nestjs/common';
import { EmergencydocService } from './emergencydoc.service';
import { EmergencydocController } from './emergencydoc.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { EmergencydocGateway } from './emergencydoc.gateway';

@Module({
  controllers: [EmergencydocController],
  providers: [EmergencydocService, PrismaService, EmergencydocGateway],
  exports: [EmergencydocService, EmergencydocGateway],
})
export class EmergencydocModule {}
