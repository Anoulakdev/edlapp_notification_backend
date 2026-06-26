import { Module } from '@nestjs/common';
import { CutpowerassignService } from './cutpowerassign.service';
import { CutpowerassignController } from './cutpowerassign.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CutpowerassignController],
  providers: [CutpowerassignService, PrismaService],
})
export class CutpowerassignModule {}
