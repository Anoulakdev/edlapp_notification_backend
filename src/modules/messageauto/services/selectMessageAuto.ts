import { PrismaService } from '../../../prisma/prisma.service';

export async function selectMessageAuto(
  prisma: PrismaService,
  topicId?: number,
  search?: string,
) {
  const messageautos = await prisma.messageAuto.findMany({
    where: {
      topicId: topicId ? Number(topicId) : undefined,
      ...(search
        ? {
            messageTopic: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      messageTopic: true,
      topic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return messageautos;
}
