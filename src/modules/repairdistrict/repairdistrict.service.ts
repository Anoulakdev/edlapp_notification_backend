import { Injectable } from '@nestjs/common';
import { CreateRepairdistrictDto } from './dto/create-repairdistrict.dto';
import { UpdateRepairdistrictDto } from './dto/update-repairdistrict.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createRepairDistrict } from './services/create';
import { findAllRepairDistrict } from './services/findall';
import { findOneRepairDistrict } from './services/findone';
import { removeRepairDistrict } from './services/remove';
import { updateRepairDistrict } from './services/update';
import { selectRepairDistrict } from './services/selectRepairDistarict';

@Injectable()
export class RepairdistrictService {
  constructor(private prisma: PrismaService) {}

  create(user: AuthUser, createRepairdistrictDto: CreateRepairdistrictDto) {
    return createRepairDistrict(this.prisma, user, createRepairdistrictDto);
  }

  findAll(page?: number, limit?: number) {
    return findAllRepairDistrict(this.prisma, page, limit);
  }

  selectRepairDistrict(branchId?: number) {
    return selectRepairDistrict(this.prisma, branchId);
  }

  findOne(id: number) {
    return findOneRepairDistrict(this.prisma, id);
  }

  update(
    user: AuthUser,
    id: number,
    updateRepairdistrictDto: UpdateRepairdistrictDto,
  ) {
    return updateRepairDistrict(this.prisma, user, id, updateRepairdistrictDto);
  }

  remove(id: number) {
    return removeRepairDistrict(this.prisma, id);
  }
}
