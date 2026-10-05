import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllVoltage(prisma: PrismaService) {
  return prisma.voltage.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      turnoffDocs: {
        take: 1,
        select: {
          id: true,
        },
      },
      emergencyDocs: {
        take: 1,
        select: {
          id: true,
        },
      },
      cutpowerDocs: {
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });
}
