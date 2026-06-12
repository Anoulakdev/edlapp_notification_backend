import { Injectable } from '@nestjs/common';
// import { CreateTurnoffassignDto } from './dto/create-turnoffassign.dto';
import { UpdateTurnoffassignDto } from './dto/update-turnoffassign.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { FindAllTurnoffAssign } from './services/findall';
import { findOneTurnoffAssign } from './services/findone';
import { updateTurnoffAssign } from './services/update';

@Injectable()
export class TurnoffassignService {
  constructor(private prisma: PrismaService) {}

  findAll(userAppId: number) {
    return FindAllTurnoffAssign(this.prisma, userAppId);
  }

  findOne(id: number) {
    return findOneTurnoffAssign(this.prisma, id);
  }

  update(id: number, updateTurnoffassignDto: UpdateTurnoffassignDto) {
    return updateTurnoffAssign(this.prisma, id, updateTurnoffassignDto);
  }
}
