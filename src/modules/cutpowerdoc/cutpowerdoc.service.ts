import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateCutpowerdocDto } from './dto/create-cutpowerdoc.dto';
import { UpdateCutpowerdocDto } from './dto/update-cutpowerdoc.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createCutpowerDoc } from './services/create';
import {
  FindAllCutpowerDoc,
  FindAllCutpowerDocOptions,
} from './services/findall';
import { findOneCutpowerDoc } from './services/findone';
import { updateCutpowerDoc } from './services/update';
import { removeCutpowerDoc } from './services/remove';
import { updateAddress } from './services/updateAddress';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class CutpowerdocService {
  private readonly events$ = new Subject<MessageEvent>();

  constructor(private prisma: PrismaService) {}

  getEventsObservable(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  triggerRefresh() {
    this.events$.next({ data: { action: 'refresh' } });
  }

  async create(
    createCutpowerdocDto: CreateCutpowerdocDto,
    user: AuthUser,
    Docfilename: string,
  ) {
    const result = await createCutpowerDoc(
      this.prisma,
      user,
      createCutpowerdocDto,
      Docfilename,
    );
    this.triggerRefresh();
    return result;
  }

  findAll(user: AuthUser, options?: FindAllCutpowerDocOptions) {
    return FindAllCutpowerDoc(this.prisma, user, options);
  }

  findOne(id: number) {
    return findOneCutpowerDoc(this.prisma, id);
  }

  async update(id: number, updateCutpowerdocDto: UpdateCutpowerdocDto) {
    const result = await updateCutpowerDoc(
      this.prisma,
      id,
      updateCutpowerdocDto,
    );
    this.triggerRefresh();
    return result;
  }

  async updateAddress(id: number, updateCutpowerdocDto: UpdateCutpowerdocDto) {
    const result = await updateAddress(this.prisma, id, updateCutpowerdocDto);
    this.triggerRefresh();
    return result;
  }

  async remove(id: number) {
    const result = await removeCutpowerDoc(this.prisma, id);
    this.triggerRefresh();
    return result;
  }
}
