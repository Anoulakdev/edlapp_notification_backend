import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createTopic(
  prisma: PrismaService,
  user: AuthUser,
  createTopicDto: CreateTopicDto,
) {
  return prisma.topic.create({
    data: { ...createTopicDto, createdById: user.id },
  });
}
