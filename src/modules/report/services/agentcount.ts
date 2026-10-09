import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class AgentCountOptions {
  startDate?: string;
  endDate?: string;
}

export const TARGET_PHRASE =
  'ເຈົ້າ ສາຍດ່ວນໄຟຟ້າລາວຍິນດີໃຫ້ບໍລິການ ຂໍຂອບໃຈ❤️❤️❤️';

export async function agentCountReport(
  prisma: PrismaService,
  user: AuthUser,
  options: AgentCountOptions = {},
) {
  const where: Prisma.MessageWhereInput = {
    agentId: { not: null },
    deletedAt: null,
    OR: [
      { content: { contains: TARGET_PHRASE } },
      { content: { contains: 'ເຈົ້າ ສາຍດ່ວນໄຟຟ້າລາວຍິນດີໃຫ້ບໍລິການ ຂໍຂອບໃຈ' } },
    ],
  };

  if (options.startDate || options.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (options.startDate) {
      dateFilter.gte = moment
        .tz(options.startDate, 'Asia/Vientiane')
        .startOf('day')
        .toDate();
    }
    if (options.endDate) {
      dateFilter.lte = moment
        .tz(options.endDate, 'Asia/Vientiane')
        .endOf('day')
        .toDate();
    }
    where.createdAt = dateFilter;
  }

  // Database-level group by aggregation on table message
  const groupedMessages = await prisma.message.groupBy({
    by: ['agentId'],
    where,
    _count: {
      _all: true,
    },
  });

  if (!groupedMessages.length) {
    return [];
  }

  const agentIds = groupedMessages
    .map((g) => g.agentId)
    .filter((id): id is number => id !== null);

  const agents = await prisma.user.findMany({
    where: { id: { in: agentIds } },
    select: {
      id: true,
      username: true,
      roleId: true,
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
  });

  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const resultList = groupedMessages
    .filter((g) => g.agentId !== null)
    .map((group) => {
      const count = group._count._all || 0;
      const agent = group.agentId ? agentMap.get(group.agentId) || null : null;

      return {
        agentId: group.agentId as number,
        agent,
        totalCount: count,
      };
    });

  // Sort descending by totalCount, then by agentId
  resultList.sort((a, b) => b.totalCount - a.totalCount || a.agentId - b.agentId);

  return resultList;
}
