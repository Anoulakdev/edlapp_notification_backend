import { Module } from '@nestjs/common';
import { ProblemdocService } from './problemdoc.service';
import { ProblemdocController } from './problemdoc.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ProblemdocGateway } from './problemdoc.gateway';

@Module({
  controllers: [ProblemdocController],
  providers: [ProblemdocService, PrismaService, ProblemdocGateway],
  exports: [ProblemdocService, ProblemdocGateway],
})
export class ProblemdocModule {}
