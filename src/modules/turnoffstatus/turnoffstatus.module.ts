import { Module } from '@nestjs/common';
import { TurnoffstatusService } from './turnoffstatus.service';
import { TurnoffstatusController } from './turnoffstatus.controller';

@Module({
  controllers: [TurnoffstatusController],
  providers: [TurnoffstatusService],
})
export class TurnoffstatusModule {}
