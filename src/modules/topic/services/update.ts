import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTopicDto } from '../dto/update-topic.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function updateTopic(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateTopicDto: UpdateTopicDto,
) {
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) throw new NotFoundException('topic not found');

  return prisma.topic.update({
    where: { id },
    data: { ...updateTopicDto, createdById: user.id },
  });
}
