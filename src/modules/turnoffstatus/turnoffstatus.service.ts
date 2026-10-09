import { Injectable } from '@nestjs/common';
import { CreateTurnoffstatusDto } from './dto/create-turnoffstatus.dto';
import { UpdateTurnoffstatusDto } from './dto/update-turnoffstatus.dto';

@Injectable()
export class TurnoffstatusService {
  create(createTurnoffstatusDto: CreateTurnoffstatusDto) {
    return 'This action adds a new turnoffstatus';
  }

  findAll() {
    return `This action returns all turnoffstatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} turnoffstatus`;
  }

  update(id: number, updateTurnoffstatusDto: UpdateTurnoffstatusDto) {
    return `This action updates a #${id} turnoffstatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} turnoffstatus`;
  }
}
