import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserGateway } from '../user/user.gateway';
import { userOnline } from './services/userOnline';
import { userAll } from './services/userAll';
import { dashAll } from './services/dashAll';
import { AuthUser } from '../../interfaces/auth-user.interface';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly userGateway?: UserGateway,
  ) {}

  userOnline() {
    return userOnline(this.prisma, this.userGateway);
  }

  userAll() {
    return userAll(this.prisma);
  }

  dashAll(
    user: AuthUser,
    year: number,
    provinceId?: number,
    districtId?: number,
  ) {
    return dashAll(this.prisma, user, year, provinceId, districtId);
  }
}

