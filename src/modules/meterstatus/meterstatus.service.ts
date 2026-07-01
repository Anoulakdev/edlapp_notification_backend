import { Injectable } from '@nestjs/common';
import { CreateMeterstatusDto } from './dto/create-meterstatus.dto';
import { UpdateMeterstatusDto } from './dto/update-meterstatus.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createMeterstatus } from './services/create';
import { findAllMeterstatus } from './services/findall';
import { findOneMeterstatus } from './services/findone';
import { updateMeterstatus } from './services/update';
import { removeMeterstatus } from './services/remove';
import { selectStatus } from './services/selectStatus';

@Injectable()
export class MeterstatusService {
  constructor(private prisma: PrismaService) {}

  create(createMeterstatusDto: CreateMeterstatusDto) {
    return createMeterstatus(this.prisma, createMeterstatusDto);
  }

  findAll() {
    return findAllMeterstatus(this.prisma);
  }

  selectStatus() {
    return selectStatus(this.prisma);
  }

  findOne(id: number) {
    return findOneMeterstatus(this.prisma, id);
  }

  update(id: number, updateMeterstatusDto: UpdateMeterstatusDto) {
    return updateMeterstatus(this.prisma, id, updateMeterstatusDto);
  }

  remove(id: number) {
    return removeMeterstatus(this.prisma, id);
  }
}
