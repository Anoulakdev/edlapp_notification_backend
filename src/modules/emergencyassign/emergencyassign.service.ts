import { Injectable } from '@nestjs/common';
import { CreateEmergencyassignDto } from './dto/create-emergencyassign.dto';
import { UpdateEmergencyassignDto } from './dto/update-emergencyassign.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { FindAllEmergencyAssign } from './services/findall';
import { findOneEmergencyAssign } from './services/findone';
import { updateEmergencyAssign } from './services/update';

@Injectable()
export class EmergencyassignService {
  constructor(private prisma: PrismaService) {}

  findAll(userAppId: number, page?: number, limit?: number) {
    return FindAllEmergencyAssign(this.prisma, userAppId, page, limit);
  }

  findOne(id: number) {
    return findOneEmergencyAssign(this.prisma, id);
  }

  update(id: number, updateEmergencyassignDto: UpdateEmergencyassignDto) {
    return updateEmergencyAssign(this.prisma, id, updateEmergencyassignDto);
  }
}
