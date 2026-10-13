import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllEmergencyStatus(prisma: PrismaService) {
  return prisma.emergencyStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
