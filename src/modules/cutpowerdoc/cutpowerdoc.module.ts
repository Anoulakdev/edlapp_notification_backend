import { Module } from '@nestjs/common';
import { CutpowerdocService } from './cutpowerdoc.service';
import { CutpowerdocController } from './cutpowerdoc.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CutpowerdocGateway } from './cutpowerdoc.gateway';

@Module({
  controllers: [CutpowerdocController],
  providers: [CutpowerdocService, PrismaService, CutpowerdocGateway],
  exports: [CutpowerdocService, CutpowerdocGateway],
})
export class CutpowerdocModule {}
