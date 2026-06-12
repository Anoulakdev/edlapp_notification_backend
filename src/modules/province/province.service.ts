import { Injectable } from '@nestjs/common';
// import { CreateProvinceDto } from './dto/create-province.dto';
// import { UpdateProvinceDto } from './dto/update-province.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createProvince } from './services/create';
import { findAllProvince } from './services/findall';
import { findOneProvince } from './services/findone';
import { selectProvince } from './services/selectProvince';

@Injectable()
export class ProvinceService {
  constructor(private prisma: PrismaService) {}

  create() {
    return createProvince(this.prisma);
  }

  findAll() {
    return findAllProvince(this.prisma);
  }

  selectProvince() {
    return selectProvince(this.prisma);
  }

  findOne(id: number) {
    return findOneProvince(this.prisma, id);
  }
}
