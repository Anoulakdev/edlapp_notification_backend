import { Injectable } from '@nestjs/common';
import { CreateProblemtypeDto } from './dto/create-problemtype.dto';
import { UpdateProblemtypeDto } from './dto/update-problemtype.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createProblemType } from './services/create';
import { findAllProblemType } from './services/findall';
import { findOneProblemType } from './services/findone';
import { updateProblemType } from './services/update';
import { removeProblemType } from './services/remove';
import { selectProblemType } from './services/selectProblemType';

@Injectable()
export class ProblemtypeService {
  constructor(private prisma: PrismaService) {}

  create(user: AuthUser, createProblemtypeDto: CreateProblemtypeDto) {
    return createProblemType(this.prisma, user, createProblemtypeDto);
  }

  findAll() {
    return findAllProblemType(this.prisma);
  }

  selectProblemType() {
    return selectProblemType(this.prisma);
  }

  findOne(id: number) {
    return findOneProblemType(this.prisma, id);
  }

  update(
    user: AuthUser,
    id: number,
    updateProblemtypeDto: UpdateProblemtypeDto,
  ) {
    return updateProblemType(this.prisma, user, id, updateProblemtypeDto);
  }

  remove(id: number) {
    return removeProblemType(this.prisma, id);
  }
}
