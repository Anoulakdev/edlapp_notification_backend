import { Module } from '@nestjs/common';
import { MessageautoService } from './messageauto.service';
import { MessageautoController } from './messageauto.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MessageautoController],
  providers: [MessageautoService, PrismaService],
})
export class MessageautoModule {}
