import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateRegistermeterDto } from './dto/create-registermeter.dto';
import { CreateForwardDto } from './dto/create-forward.dto';
import { UpdateRegistermeterDto } from './dto/update-registermeter.dto';
import { UpdateForwardDto } from './dto/update-forward.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createRegistermeter } from './services/create';
import { findOneRegisterMeter } from './services/findone';
import { updateRegisterMeter } from './services/update';
import { removeRegisterMeter } from './services/remove';
import { createForward } from './services/createForward';
import { updateForward } from './services/updateForward';

import {
  FindAllRegistermeter,
  FindAllRegistermeterOptions,
} from './services/findall';
import {
  registerMeterEdlApp,
  RegisterMeterEdlAppOptions,
} from './services/edlapp';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class RegistermeterService {
  private readonly events$ = new Subject<MessageEvent>();

  constructor(private readonly prisma: PrismaService) {}

  getEventsObservable(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  triggerRefresh() {
    this.events$.next({ data: { action: 'refresh' } });
  }

  async create(user: AuthUser, createRegistermeterDto: CreateRegistermeterDto) {
    const result = await createRegistermeter(
      this.prisma,
      user,
      createRegistermeterDto,
    );
    this.triggerRefresh();
    return result;
  }

  async createForward(user: AuthUser, createForwardDto: CreateForwardDto) {
    const result = await createForward(this.prisma, user, createForwardDto);
    this.triggerRefresh();
    return result;
  }

  async findAll(user: AuthUser, options?: FindAllRegistermeterOptions) {
    return FindAllRegistermeter(this.prisma, user, options);
  }

  async EDLAPP(userAppId: number, options?: RegisterMeterEdlAppOptions) {
    return await registerMeterEdlApp(this.prisma, userAppId, options);
  }

  async findOne(id: number) {
    return findOneRegisterMeter(this.prisma, id);
  }

  async update(id: number, updateRegistermeterDto: UpdateRegistermeterDto) {
    const result = await updateRegisterMeter(
      this.prisma,
      id,
      updateRegistermeterDto,
    );
    this.triggerRefresh();
    return result;
  }

  async updateForward(
    user: AuthUser,
    id: number,
    updateForwardDto: UpdateForwardDto,
  ) {
    const result = await updateForward(this.prisma, user, id, updateForwardDto);
    this.triggerRefresh();
    return result;
  }

  async remove(id: number) {
    const result = await removeRegisterMeter(this.prisma, id);
    this.triggerRefresh();
    return result;
  }
}
