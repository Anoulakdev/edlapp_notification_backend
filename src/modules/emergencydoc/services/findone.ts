import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneEmergencyDoc(prisma: PrismaService, id: number) {
  const emergencyDoc = await prisma.emergencyDoc.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              gender: true,
              emp_code: true,
            },
          },
        },
      },
      province: true,
      district: true,
      emergencyAddresses: {
        select: {
          id: true,
          villageId: true,
          village: true,
          userCount: true,
        },
      },
      emergencyAssigns: true,
    },
  });
  if (!emergencyDoc) throw new NotFoundException('emergencyDoc not found');
  return {
    ...emergencyDoc,
    emergencyDate: moment(emergencyDoc.emergencyDate)
      .tz('Asia/Vientiane')
      .format('YYYY-MM-DD'),
    createdAt: moment(emergencyDoc.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(emergencyDoc.updatedAt).tz('Asia/Vientiane').format(),
  };
}
