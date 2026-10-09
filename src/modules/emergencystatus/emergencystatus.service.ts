import { Injectable } from '@nestjs/common';
import { CreateEmergencystatusDto } from './dto/create-emergencystatus.dto';
import { UpdateEmergencystatusDto } from './dto/update-emergencystatus.dto';

@Injectable()
export class EmergencystatusService {
  create(createEmergencystatusDto: CreateEmergencystatusDto) {
    return 'This action adds a new emergencystatus';
  }

  findAll() {
    return `This action returns all emergencystatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} emergencystatus`;
  }

  update(id: number, updateEmergencystatusDto: UpdateEmergencystatusDto) {
    return `This action updates a #${id} emergencystatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} emergencystatus`;
  }
}
