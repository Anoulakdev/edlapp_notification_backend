import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMessageautoDto } from '../dto/create-messageauto.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createMessageAuto(
  prisma: PrismaService,
  createMessageautoDto: CreateMessageautoDto,
) {
  return prisma.messageAuto.create({
    data: {
      ...createMessageautoDto,
      topicId: Number(createMessageautoDto.topicId),
    },
  });
}
