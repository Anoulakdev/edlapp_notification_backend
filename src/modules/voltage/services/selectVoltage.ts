import { PrismaService } from '../../../prisma/prisma.service';

export async function selectVoltage(prisma: PrismaService) {
  return prisma.voltage.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  });
}
