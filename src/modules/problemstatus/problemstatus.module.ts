import { Module } from '@nestjs/common';
import { ProblemstatusService } from './problemstatus.service';
import { ProblemstatusController } from './problemstatus.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProblemstatusController],
  providers: [ProblemstatusService, PrismaService],
})
export class ProblemstatusModule {}
