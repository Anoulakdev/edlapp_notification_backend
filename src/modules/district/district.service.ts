import { Injectable } from '@nestjs/common';
// import { CreateDistrictDto } from './dto/create-district.dto';
// import { UpdateDistrictDto } from './dto/update-district.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createDistrict } from './services/create';
import { findAllDistrict } from './services/findall';
import { findOneDistrict } from './services/findone';
import { selectDistrict } from './services/selectDistrict';
import { AuthUser } from '../../interfaces/auth-user.interface';

@Injectable()
export class DistrictService {
  constructor(private prisma: PrismaService) {}

  create() {
    return createDistrict(this.prisma);
  }

  findAll() {
    return findAllDistrict(this.prisma);
  }

  selectDistrict(provinceCode?: string, user?: AuthUser) {
    return selectDistrict(this.prisma, provinceCode, user);
  }

  findOne(id: number) {
    return findOneDistrict(this.prisma, id);
  }
}
