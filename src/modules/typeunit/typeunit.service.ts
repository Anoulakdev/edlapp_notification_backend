import { Injectable } from '@nestjs/common';
import { CreateTypeunitDto } from './dto/create-typeunit.dto';
import { UpdateTypeunitDto } from './dto/update-typeunit.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createTypeUnit } from './services/create';
import { findAllTypeUnit } from './services/findall';
import { findOneTypeUnit } from './services/findone';
import { updateTypeUnit } from './services/update';
import { removeTypeUnit } from './services/remove';
import { selectTypeUnit } from './services/selectTypeUnit';
import { updateStatus } from './services/updateStatus';

@Injectable()
export class TypeunitService {
  constructor(private prisma: PrismaService) {}

  create(createTypeunitDto: CreateTypeunitDto) {
    return createTypeUnit(this.prisma, createTypeunitDto);
  }

  findAll() {
    return findAllTypeUnit(this.prisma);
  }

  selectTypeUnit() {
    return selectTypeUnit(this.prisma);
  }

  findOne(id: number) {
    return findOneTypeUnit(this.prisma, id);
  }

  update(id: number, updateTypeunitDto: UpdateTypeunitDto) {
    return updateTypeUnit(this.prisma, id, updateTypeunitDto);
  }

  updateStatus(id: number, actived: string) {
    return updateStatus(this.prisma, id, actived);
  }

  remove(id: number) {
    return removeTypeUnit(this.prisma, id);
  }
}
