import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { turnoffReport, TurnoffOptions } from './services/turnoff';
import { emergencyReport, EmergencyOptions } from './services/emergency';
import { cutpowerReport, CutpowerDocOptions } from './services/cutpower';
import {
  registermeterReport,
  RegistermeterOptions,
} from './services/registermeter';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  turnoffReport(user: AuthUser, options?: TurnoffOptions) {
    return turnoffReport(this.prisma, user, options);
  }

  emergencyReport(user: AuthUser, options?: EmergencyOptions) {
    return emergencyReport(this.prisma, user, options);
  }

  cutpowerReport(user: AuthUser, options?: CutpowerDocOptions) {
    return cutpowerReport(this.prisma, user, options);
  }

  registermeterReport(user: AuthUser, options?: RegistermeterOptions) {
    return registermeterReport(this.prisma, user, options);
  }
}
