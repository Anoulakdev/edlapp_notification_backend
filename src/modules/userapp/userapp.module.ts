import { Module } from '@nestjs/common';
import { UserappService } from './userapp.service';
import { UserappController } from './userapp.controller';

@Module({
  controllers: [UserappController],
  providers: [UserappService],
})
export class UserappModule {}
