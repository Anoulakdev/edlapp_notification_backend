import { Module } from '@nestjs/common';
import { TypeunitService } from './typeunit.service';
import { TypeunitController } from './typeunit.controller';

@Module({
  controllers: [TypeunitController],
  providers: [TypeunitService],
})
export class TypeunitModule {}
