import { Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createEquipment } from './services/create';
import { findAllEquipment } from './services/findall';
import { findOneEquipment } from './services/findone';
import { updateEquipment } from './services/update';
import { removeEquipment } from './services/remove';
import { selectEquipment } from './services/selectEquipment';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  create(authUser: AuthUser, createEquipmentDto: CreateEquipmentDto) {
    return createEquipment(this.prisma, authUser, createEquipmentDto);
  }

  findAll() {
    return findAllEquipment(this.prisma);
  }

  selectEquipment(typeEquipmentId?: number) {
    return selectEquipment(this.prisma, typeEquipmentId);
  }

  findOne(id: number) {
    return findOneEquipment(this.prisma, id);
  }

  update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    return updateEquipment(this.prisma, id, updateEquipmentDto);
  }

  updateStatus(id: number, actived: string) {
    return updateStatus(this.prisma, id, actived);
  }

  remove(id: number) {
    return removeEquipment(this.prisma, id);
  }
}
