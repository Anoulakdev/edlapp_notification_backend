import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { findAllPayment, FindAllPaymentOptions } from './services/findall';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  findAll(user: AuthUser, query: FindAllPaymentOptions) {
    return findAllPayment(this.prisma, user, query);
  }

  selectBranch(user: AuthUser, query: FindAllPaymentOptions) {
    return findAllPayment(this.prisma, user, query);
  }
}
