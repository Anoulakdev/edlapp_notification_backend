import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateProblemdocDto } from './dto/create-problemdoc.dto';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { UpdateProblemdocDto } from './dto/update-problemdoc.dto';
import { UpdateReceiverDto } from './dto/update-receiver.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createProblemDoc } from './services/create';
import {
  FindAllProblemDoc,
  FindAllProblemDocOptions,
} from './services/findall';
import { findOneProblemDoc } from './services/findone';
import { updateProblemDoc } from './services/update';
import { removeProblemDoc } from './services/remove';
import { Subject, Observable } from 'rxjs';
import { problemDocEdlApp, ProblemDocEdlAppOptions } from './services/edlapp';
import { createReceiver } from './services/receiver';
import { updateRepair } from './services/repair';

@Injectable()
export class ProblemdocService {
  private readonly events$ = new Subject<MessageEvent>();

  constructor(private prisma: PrismaService) {}

  getEventsObservable(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  triggerRefresh() {
    this.events$.next({ data: { action: 'refresh' } });
  }

  async create(createProblemdocDto: CreateProblemdocDto, Docfilename?: string) {
    const result = await createProblemDoc(
      this.prisma,
      createProblemdocDto,
      Docfilename,
    );
    this.triggerRefresh();
    return result;
  }

  async createReceiver(user: AuthUser, createReceiverDto: CreateReceiverDto) {
    const result = await createReceiver(this.prisma, user, createReceiverDto);
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
    return findOneProblemDoc(this.prisma, id);
  }

  async update(id: number, updateProblemdocDto: UpdateProblemdocDto) {
    const result = await updateProblemDoc(this.prisma, id, updateProblemdocDto);
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
