import { Injectable } from '@nestjs/common';
// import { CreateVillageDto } from './dto/create-village.dto';
// import { UpdateVillageDto } from './dto/update-village.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createVillage } from './services/create';
import { findAllVillage } from './services/findall';
import { findOneVillage } from './services/findone';
import { selectVillage } from './services/selectVillage';

@Injectable()
export class VillageService {
  constructor(private prisma: PrismaService) {}

  create() {
    return createVillage(this.prisma);
  }

  findAll() {
    return findAllVillage(this.prisma);
  }

  selectVillage(districtCode?: string) {
    return selectVillage(this.prisma, districtCode);
  }

  findOne(id: number) {
    return findOneVillage(this.prisma, id);
  }
}
