import { Module } from '@nestjs/common';
import { SourcetypeService } from './sourcetype.service';
import { SourcetypeController } from './sourcetype.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SourcetypeController],
  providers: [SourcetypeService, PrismaService],
})
export class SourcetypeModule {}
