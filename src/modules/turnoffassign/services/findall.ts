import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindAllTurnoffAssign(
  prisma: PrismaService,
  userAppId: number,
) {
  const turnoffAssigns = await prisma.turnoffAssign.findMany({
    where: { userAppId: Number(userAppId) },
    orderBy: {
      turnoff: {
        id: 'desc',
      },
    },
    include: {
      turnoff: true,
    },
  });

  return turnoffAssigns.map((turnoffAssign) => {
    return {
      ...turnoffAssign,
      createdAt: moment(turnoffAssign.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(turnoffAssign.updatedAt).tz('Asia/Vientiane').format(),
      turnoff: {
        ...turnoffAssign.turnoff,
        startDate: moment(turnoffAssign.turnoff.startDate).format('YYYY-MM-DD'),
        endDate: moment(turnoffAssign.turnoff.endDate).format('YYYY-MM-DD'),
      },
    };
  });
}
