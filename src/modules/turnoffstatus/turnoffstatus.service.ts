import { Injectable } from '@nestjs/common';
import { CreateTurnoffstatusDto } from './dto/create-turnoffstatus.dto';
import { UpdateTurnoffstatusDto } from './dto/update-turnoffstatus.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createTurnoffStatus } from './services/create';
import { findAllTurnoffStatus } from './services/findall';
import { findOneTurnoffStatus } from './services/findone';
import { updateTurnoffStatus } from './services/update';
import { removeTurnoffStatus } from './services/remove';
import { selectTurnoffStatus } from './services/selectTurnoffStatus';

@Injectable()
export class TurnoffstatusService {
  constructor(private prisma: PrismaService) {}

  create(createTurnoffstatusDto: CreateTurnoffstatusDto) {
    return createTurnoffStatus(this.prisma, createTurnoffstatusDto);
  }

  findAll() {
    return findAllTurnoffStatus(this.prisma);
  }

  selectTurnoffStatus() {
    return selectTurnoffStatus(this.prisma);
  }

  findOne(id: number) {
    return findOneTurnoffStatus(this.prisma, id);
  }

  update(id: number, updateTurnoffstatusDto: UpdateTurnoffstatusDto) {
    return updateTurnoffStatus(this.prisma, id, updateTurnoffstatusDto);
  }

  remove(id: number) {
    return removeTurnoffStatus(this.prisma, id);
  }
}
