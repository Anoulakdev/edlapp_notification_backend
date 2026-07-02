import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationGateway } from './conversation.gateway';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, ConversationGateway],
})
export class ConversationModule {}
