import { Injectable } from '@nestjs/common';
import { CreateProblemdocDto } from './dto/create-problemdoc.dto';
import { UpdateProblemdocDto } from './dto/update-problemdoc.dto';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createProblemDoc } from './services/create';
import { createAssign } from './services/assign';
import { updateAssign } from './services/updateassign';
import {
  FindAllProblemDoc,
  FindAllProblemDocOptions,
} from './services/findall';
import { findOneProblemDoc } from './services/findone';
import { updateProblemDoc } from './services/update';
import { removeProblemDoc } from './services/remove';
import { problemDocEdlApp, ProblemDocEdlAppOptions } from './services/edlapp';
import { updateReceiver } from './services/updatereceive';
import { updateRepair } from './services/repair';
import { ProblemdocGateway } from './problemdoc.gateway';

@Injectable()
export class ProblemdocService {
  constructor(
    private prisma: PrismaService,
    private problemdocGateway: ProblemdocGateway,
  ) {}

  triggerRefresh() {
    this.problemdocGateway.emitRefresh();
  }

  async create(
    user: AuthUser,
    createProblemdocDto: CreateProblemdocDto,
    Docfilename?: string,
  ) {
    const result = await createProblemDoc(
      this.prisma,
      user,
      createProblemdocDto,
      Docfilename,
    );
    this.triggerRefresh();
    return result;
  }

  async createAssign(user: AuthUser, createReceiverDto: CreateReceiverDto) {
    const result = await createAssign(this.prisma, user, createReceiverDto);
    this.triggerRefresh();
    return result;
  }

  async findAll(user: AuthUser, options?: FindAllProblemDocOptions) {
    return await FindAllProblemDoc(this.prisma, user, options);
  }

  async EDLAPP(userAppId: number, options?: ProblemDocEdlAppOptions) {
    return await problemDocEdlApp(this.prisma, userAppId, options);
  }

  async findOne(id: number) {
    return await findOneProblemDoc(this.prisma, id);
  }

  async update(id: number, updateProblemdocDto: UpdateProblemdocDto) {
    const result = await updateProblemDoc(this.prisma, id, updateProblemdocDto);
    this.triggerRefresh();
    return result;
  }

  async updateAssign(
    user: AuthUser,
    id: number,
    updateReceiverDto: UpdateReceiverDto,
  ) {
    const result = await updateAssign(this.prisma, user, id, updateReceiverDto);
    this.triggerRefresh();
    return result;
  }

  async updateReceiver(
    user: AuthUser,
    id: number,
    updateReceiverDto: UpdateReceiverDto,
  ) {
    const result = await updateReceiver(
      this.prisma,
      user,
      id,
      updateReceiverDto,
    );
    this.triggerRefresh();
    return result;
  }

  async updateRepair(
    user: AuthUser,
    id: number,
    updateReceiverDto: UpdateReceiverDto,
  ) {
    const result = await updateRepair(this.prisma, user, id, updateReceiverDto);
    this.triggerRefresh();
    return result;
  }

  async remove(id: number) {
    const result = await removeProblemDoc(this.prisma, id);
    this.triggerRefresh();
    return result;
  }
}
