import { Injectable } from '@nestjs/common';
import { CreateTyperepairDto } from './dto/create-typerepair.dto';
import { UpdateTyperepairDto } from './dto/update-typerepair.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createTypeRepair } from './services/create';
import { findAllTypeRepair } from './services/findall';
import { findOneTypeRepair } from './services/findone';
import { updateTypeRepair } from './services/update';
import { removeTypeRepair } from './services/remove';
import { selectTypeRepair } from './services/selectTypeRepair';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class TyperepairService {
  constructor(private prisma: PrismaService) {}

  create(createTyperepairDto: CreateTyperepairDto) {
    return createTypeRepair(this.prisma, createTyperepairDto);
  }

  findAll() {
    return findAllTypeRepair(this.prisma);
  }

  selectTypeRepair() {
    return selectTypeRepair(this.prisma);
  }

  findOne(id: number) {
    return findOneTypeRepair(this.prisma, id);
  }

  update(id: number, updateTyperepairDto: UpdateTyperepairDto) {
    return updateTypeRepair(this.prisma, id, updateTyperepairDto);
  }

  updateStatus(id: number, actived: string) {
    return updateStatus(this.prisma, id, actived);
  }

  remove(id: number) {
    return removeTypeRepair(this.prisma, id);
  }
}
