import { Module } from '@nestjs/common';
import { RegistermeterService } from './registermeter.service';
import { RegistermeterController } from './registermeter.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistermeterGateway } from './registermeter.gateway';

@Module({
  controllers: [RegistermeterController],
  providers: [RegistermeterService, PrismaService, RegistermeterGateway],
  exports: [RegistermeterService, RegistermeterGateway],
})
export class RegistermeterModule {}
