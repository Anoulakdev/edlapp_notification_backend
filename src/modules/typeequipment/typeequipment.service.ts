import { Injectable } from '@nestjs/common';
import { CreateTypeequipmentDto } from './dto/create-typeequipment.dto';
import { UpdateTypeequipmentDto } from './dto/update-typeequipment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createTypeEquipment } from './services/create';
import { findAllTypeEquipment } from './services/findall';
import { findOneTypeEquipment } from './services/findone';
import { updateTypeEquipment } from './services/update';
import { removeTypeEquipment } from './services/remove';
import { selectTypeEquipment } from './services/selectTypeEquipment';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class TypeequipmentService {
  constructor(private prisma: PrismaService) {}

  create(authUser: AuthUser, createTypeequipmentDto: CreateTypeequipmentDto) {
    return createTypeEquipment(this.prisma, authUser, createTypeequipmentDto);
  }

  findAll() {
    return findAllTypeEquipment(this.prisma);
  }

  selectTypeEquipment() {
    return selectTypeEquipment(this.prisma);
  }

  findOne(id: number) {
    return findOneTypeEquipment(this.prisma, id);
  }

  update(id: number, updateTypeequipmentDto: UpdateTypeequipmentDto) {
    return updateTypeEquipment(this.prisma, id, updateTypeequipmentDto);
  }

  updateStatus(id: number, actived: string) {
    return updateStatus(this.prisma, id, actived);
  }

  remove(id: number) {
    return removeTypeEquipment(this.prisma, id);
  }
}
