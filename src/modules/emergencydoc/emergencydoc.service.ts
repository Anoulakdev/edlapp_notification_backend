import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateEmergencydocDto } from './dto/create-emergencydoc.dto';
import { UpdateEmergencydocDto } from './dto/update-emergencydoc.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { createEmergencyDoc } from './services/create';
import {
  FindAllEmergencyDoc,
  FindAllEmergencyDocOptions,
} from './services/findall';
import { findOneEmergencyDoc } from './services/findone';
import { updateEmergencyDoc } from './services/update';
import { removeEmergencyDoc } from './services/remove';
import { updateAddress } from './services/updateAddress';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class EmergencydocService {
  private readonly events$ = new Subject<MessageEvent>();

  constructor(private prisma: PrismaService) {}

  getEventsObservable(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  triggerRefresh() {
    this.events$.next({ data: { action: 'refresh' } });
  }

  async create(
    createEmergencydocDto: CreateEmergencydocDto,
    user: AuthUser,
    Docfilename: string,
  ) {
    const result = await createEmergencyDoc(
      this.prisma,
      user,
      createEmergencydocDto,
      Docfilename,
    );
    this.triggerRefresh();
    return result;
  }

  async findAll(user: AuthUser, options?: FindAllEmergencyDocOptions) {
    return FindAllEmergencyDoc(this.prisma, user, options);
  }

  async findOne(id: number) {
    return findOneEmergencyDoc(this.prisma, id);
  }

  async update(id: number, updateEmergencydocDto: UpdateEmergencydocDto) {
    const result = await updateEmergencyDoc(
      this.prisma,
      id,
      updateEmergencydocDto,
    );
    this.triggerRefresh();
    return result;
  }

  async updateAddress(
    id: number,
    updateEmergencydocDto: UpdateEmergencydocDto,
  ) {
    const result = await updateAddress(this.prisma, id, updateEmergencydocDto);
    this.triggerRefresh();
    return result;
  }

  async remove(id: number) {
    const result = await removeEmergencyDoc(this.prisma, id);
    this.triggerRefresh();
    return result;
  }
}
