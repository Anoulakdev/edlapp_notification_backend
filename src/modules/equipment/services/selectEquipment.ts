import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';

export async function selectEquipment(
  prisma: PrismaService,
  user?: AuthUser,
) {
  const where: Prisma.EquipmentWhereInput = {
    actived: true,
  };

  if (user?.branchId) {
    where.branchId = Number(user.branchId);
  }

  return prisma.equipment.findMany({
    where,
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      unit: true,
      branchId: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
