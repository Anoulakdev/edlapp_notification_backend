import { Injectable } from '@nestjs/common';
import { CreateSourcetypeDto } from './dto/create-sourcetype.dto';
import { UpdateSourcetypeDto } from './dto/update-sourcetype.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createSourceType } from './services/create';
import { findAllSourceType } from './services/findall';
import { findOneSourceType } from './services/findone';
import { updateSourceType } from './services/update';
import { removeSourceType } from './services/remove';

@Injectable()
export class SourcetypeService {
  constructor(private prisma: PrismaService) {}

  create(createSourcetypeDto: CreateSourcetypeDto) {
    return createSourceType(this.prisma, createSourcetypeDto);
  }

  findAll() {
    return findAllSourceType(this.prisma);
  }

  findOne(id: number) {
    return findOneSourceType(this.prisma, id);
  }

  update(id: number, updateSourcetypeDto: UpdateSourcetypeDto) {
    return updateSourceType(this.prisma, id, updateSourcetypeDto);
  }

  remove(id: number) {
    return removeSourceType(this.prisma, id);
  }
}
