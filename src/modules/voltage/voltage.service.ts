import { Injectable } from '@nestjs/common';
import { CreateVoltageDto } from './dto/create-voltage.dto';
import { UpdateVoltageDto } from './dto/update-voltage.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createVoltage } from './services/create';
import { findAllVoltage } from './services/findall';
import { findOneVoltage } from './services/findone';
import { updateVoltage } from './services/update';
import { removeVoltage } from './services/remove';
import { selectVoltage } from './services/selectVoltage';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class VoltageService {
  constructor(private prisma: PrismaService) {}

  create(createVoltageDto: CreateVoltageDto) {
    return createVoltage(this.prisma, createVoltageDto);
  }

  findAll() {
    return findAllVoltage(this.prisma);
  }

  selectVoltage() {
    return selectVoltage(this.prisma);
  }

  findOne(id: number) {
    return findOneVoltage(this.prisma, id);
  }

  update(id: number, updateVoltageDto: UpdateVoltageDto) {
    return updateVoltage(this.prisma, id, updateVoltageDto);
  }

  updateStatus(id: number, actived: string) {
    return updateStatus(this.prisma, id, actived);
  }

  remove(id: number) {
    return removeVoltage(this.prisma, id);
  }
}
