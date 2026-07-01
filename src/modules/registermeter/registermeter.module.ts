import { Module } from '@nestjs/common';
import { RegistermeterService } from './registermeter.service';
import { RegistermeterController } from './registermeter.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [RegistermeterController],
  providers: [RegistermeterService, PrismaService],
})
export class RegistermeterModule {}
