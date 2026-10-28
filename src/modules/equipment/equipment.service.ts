import { Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createEquipment } from './services/create';
import { findAllEquipment, FindAllEquipmentOptions } from './services/findall';
import { findOneEquipment } from './services/findone';
import { updateEquipment } from './services/update';
import { removeEquipment } from './services/remove';
import { selectEquipment } from './services/selectEquipment';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  create(user: AuthUser, createEquipmentDto: CreateEquipmentDto) {
    return createEquipment(this.prisma, user, createEquipmentDto);
  }

  findAll(user: AuthUser, options: FindAllEquipmentOptions = {}) {
    return findAllEquipment(this.prisma, user, options);
  }

  selectEquipment(user: AuthUser) {
    return selectEquipment(this.prisma, user);
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
