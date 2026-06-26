import { Injectable } from '@nestjs/common';
// import { CreateCutpowerassignDto } from './dto/create-cutpowerassign.dto';
import { UpdateCutpowerassignDto } from './dto/update-cutpowerassign.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { FindAllCutpowerAssign } from './services/findall';
import { findOneCutpowerAssign } from './services/findone';
import { updateCutpowerAssign } from './services/update';

@Injectable()
export class CutpowerassignService {
  constructor(private prisma: PrismaService) {}

  findAll(userAppId: number, page?: number, limit?: number) {
    return FindAllCutpowerAssign(this.prisma, userAppId, page, limit);
  }

  findOne(id: number) {
    return findOneCutpowerAssign(this.prisma, id);
  }

  update(id: number, updateCutpowerassignDto: UpdateCutpowerassignDto) {
    return updateCutpowerAssign(this.prisma, id, updateCutpowerassignDto);
  }
}
