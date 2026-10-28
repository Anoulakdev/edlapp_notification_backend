import { Module } from '@nestjs/common';
import { TyperepairService } from './typerepair.service';
import { TyperepairController } from './typerepair.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TyperepairController],
  providers: [TyperepairService, PrismaService],
})
export class TyperepairModule {}
