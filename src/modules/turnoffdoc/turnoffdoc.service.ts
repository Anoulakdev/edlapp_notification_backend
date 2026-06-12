import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateTurnoffdocDto } from './dto/create-turnoffdoc.dto';
import { UpdateTurnoffdocDto } from './dto/update-turnoffdoc.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createTurnoffDoc } from './services/create';
import {
  FindAllTurnoffDoc,
  FindAllTurnoffDocOptions,
} from './services/findall';
import { findOneTurnoffDoc } from './services/findone';
import { updateTurnoffDoc } from './services/update';
import { removeTurnoffDoc } from './services/remove';
import { updateAddress } from './services/updateAddress';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class TurnoffdocService {
  private readonly events$ = new Subject<MessageEvent>();

  constructor(private prisma: PrismaService) {}

  getEventsObservable(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  triggerRefresh() {
    this.events$.next({ data: { action: 'refresh' } });
  }

  async create(
    createTurnoffdocDto: CreateTurnoffdocDto,
    user: AuthUser,
    Docfilename: string,
  ) {
    const result = await createTurnoffDoc(
      this.prisma,
      user,
      createTurnoffdocDto,
      Docfilename,
    );
    this.triggerRefresh();
    return result;
  }

  findAll(user: AuthUser, options?: FindAllTurnoffDocOptions) {
    return FindAllTurnoffDoc(this.prisma, user, options);
  }

  findOne(id: number) {
    return findOneTurnoffDoc(this.prisma, id);
  }

  async update(id: number, updateTurnoffdocDto: UpdateTurnoffdocDto) {
    const result = await updateTurnoffDoc(this.prisma, id, updateTurnoffdocDto);
    this.triggerRefresh();
    return result;
  }

  async updateAddress(id: number, updateTurnoffdocDto: UpdateTurnoffdocDto) {
    const result = await updateAddress(this.prisma, id, updateTurnoffdocDto);
    this.triggerRefresh();
    return result;
  }

  async remove(id: number) {
    const result = await removeTurnoffDoc(this.prisma, id);
    this.triggerRefresh();
    return result;
  }
}
