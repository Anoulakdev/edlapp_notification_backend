import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function countAct(prisma: PrismaService) {
  const todayStart = moment().tz('Asia/Vientiane').startOf('day').toDate();

  const total = await prisma.activity.count({
    where: {
      endDate: {
        gte: todayStart,
      },
    },
  });

  return {
    total,
  };
}
