import { Injectable } from '@nestjs/common';
import { CreateEmergencystatusDto } from './dto/create-emergencystatus.dto';
import { UpdateEmergencystatusDto } from './dto/update-emergencystatus.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createEmergencyStatus } from './services/create';
import { findAllEmergencyStatus } from './services/findall';
import { findOneEmergencyStatus } from './services/findone';
import { updateEmergencyStatus } from './services/update';
import { removeEmergencyStatus } from './services/remove';
import { selectEmergencyStatus } from './services/selectEmergencyStatus';

@Injectable()
export class EmergencystatusService {
  constructor(private prisma: PrismaService) {}

  create(createEmergencystatusDto: CreateEmergencystatusDto) {
    return createEmergencyStatus(this.prisma, createEmergencystatusDto);
  }

  findAll() {
    return findAllEmergencyStatus(this.prisma);
  }

  selectEmergencyStatus() {
    return selectEmergencyStatus(this.prisma);
  }

  findOne(id: number) {
    return findOneEmergencyStatus(this.prisma, id);
  }

  update(id: number, updateEmergencystatusDto: UpdateEmergencystatusDto) {
    return updateEmergencyStatus(this.prisma, id, updateEmergencystatusDto);
  }

  remove(id: number) {
    return removeEmergencyStatus(this.prisma, id);
  }
}
