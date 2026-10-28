import { Injectable } from '@nestjs/common';
import { CreateRepairdistrictDto } from './dto/create-repairdistrict.dto';
import { UpdateRepairdistrictDto } from './dto/update-repairdistrict.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createRepairDistrict } from './services/create';
import {
  findAllRepairDistrict,
  FindAllRepairDistrictOptions,
} from './services/findall';
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

  findAll(options: FindAllRepairDistrictOptions = {}) {
    return findAllRepairDistrict(this.prisma, options);
  }

  selectRepairDistrict(user: AuthUser, branchId?: number) {
    return selectRepairDistrict(this.prisma, user, branchId);
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
