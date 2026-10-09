import { Module } from '@nestjs/common';
import { EmergencystatusService } from './emergencystatus.service';
import { EmergencystatusController } from './emergencystatus.controller';

@Module({
  controllers: [EmergencystatusController],
  providers: [EmergencystatusService],
})
export class EmergencystatusModule {}
