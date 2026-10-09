import { Injectable } from '@nestjs/common';
import { CreateNotiDto } from './dto/create-noti.dto';
import { UpdateNotiDto } from './dto/update-noti.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { FindAllNoti } from './services/findall';
import { FindDocumentAll } from './services/getAll';

@Injectable()
export class NotiService {
  constructor(private prisma: PrismaService) {}

  findAll(userAppId: number) {
    return FindAllNoti(this.prisma, userAppId);
  }

  getAll(
    provinceId?: number,
    districtId?: number,
    villageId?: number,
    typeNoti?: number,
    page?: number,
    limit?: number,
  ) {
    return FindDocumentAll(
      this.prisma,
      provinceId,
      districtId,
      villageId,
      typeNoti,
      page,
      limit,
    );
  }
}
