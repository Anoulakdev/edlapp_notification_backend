import { Module } from '@nestjs/common';
import { ProblemtypeService } from './problemtype.service';
import { ProblemtypeController } from './problemtype.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProblemtypeController],
  providers: [ProblemtypeService, PrismaService],
})
export class ProblemtypeModule {}
