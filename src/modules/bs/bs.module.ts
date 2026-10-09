import { Module } from '@nestjs/common';
import { BsService } from './bs.service';
import { BsController } from './bs.controller';

@Module({
  controllers: [BsController],
  providers: [BsService],
})
export class BsModule {}
