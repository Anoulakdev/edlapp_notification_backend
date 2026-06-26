import { Module } from '@nestjs/common';
import { CutpowerdocService } from './cutpowerdoc.service';
import { CutpowerdocController } from './cutpowerdoc.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CutpowerdocController],
  providers: [CutpowerdocService, PrismaService],
})
export class CutpowerdocModule {}
