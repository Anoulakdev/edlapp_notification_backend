import { Injectable } from '@nestjs/common';
import { CreateProblemstatusDto } from './dto/create-problemstatus.dto';
import { UpdateProblemstatusDto } from './dto/update-problemstatus.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { createProblemStatus } from './services/create';
import { findAllProblemStatus } from './services/findall';
import { findOneProblemStatus } from './services/findone';
import { updateProblemStatus } from './services/update';
import { removeProblemStatus } from './services/remove';

@Injectable()
export class ProblemstatusService {
  constructor(private prisma: PrismaService) {}

  create(createProblemstatusDto: CreateProblemstatusDto) {
    return createProblemStatus(this.prisma, createProblemstatusDto);
  }

  findAll() {
    return findAllProblemStatus(this.prisma);
  }

  findOne(id: number) {
    return findOneProblemStatus(this.prisma, id);
  }

  update(id: number, updateProblemstatusDto: UpdateProblemstatusDto) {
    return updateProblemStatus(this.prisma, id, updateProblemstatusDto);
  }

  remove(id: number) {
    return removeProblemStatus(this.prisma, id);
  }
}
