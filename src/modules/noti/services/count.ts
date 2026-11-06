import { PrismaService } from '../../../prisma/prisma.service';

export async function CountNoti(prisma: PrismaService, userAppId: number) {
  const where = {
    userAppId: Number(userAppId),
    docview: false,
  };

  const [turnoffCount, emergencyCount, cutpowerCount] = await Promise.all([
    prisma.turnoffAssign.count({ where }),
    prisma.emergencyAssign.count({ where }),
    prisma.cutpowerAssign.count({ where }),
  ]);

  const total = turnoffCount + emergencyCount + cutpowerCount;

  return {
    total,
  };
}
