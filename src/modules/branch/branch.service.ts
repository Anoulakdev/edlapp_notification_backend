import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createBranch } from './services/create';
import { findAllBranch } from './services/findall';
import { selectBranch } from './services/selectBranch';
import { findOneBranch } from './services/findone';
import { updateBranch } from './services/update';
import { removeBranch } from './services/remove';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  create(user: AuthUser, createBranchDto: CreateBranchDto) {
    return createBranch(this.prisma, user, createBranchDto);
  }

  findAll() {
    return findAllBranch(this.prisma);
  }

  selectBranch() {
    return selectBranch(this.prisma);
  }

  findOne(id: number) {
    return findOneBranch(this.prisma, id);
  }

  update(user: AuthUser, id: number, updateBranchDto: UpdateBranchDto) {
    return updateBranch(this.prisma, user, id, updateBranchDto);
  }

  remove(id: number) {
    return removeBranch(this.prisma, id);
  }
}
