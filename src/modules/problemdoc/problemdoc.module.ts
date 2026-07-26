import { Module } from '@nestjs/common';
import { ProblemdocService } from './problemdoc.service';
import { ProblemdocController } from './problemdoc.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProblemdocController],
  providers: [ProblemdocService, PrismaService],
})
export class ProblemdocModule {}
