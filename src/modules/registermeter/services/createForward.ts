import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateForwardDto } from '../dto/create-forward.dto';

export async function createForward(
  prisma: PrismaService,
  user: AuthUser,
  createForwardDto: CreateForwardDto,
) {
  return await prisma.$transaction(async (tx) => {
    await tx.registerMeter.update({
      where: { id: Number(createForwardDto.meterId) },
      data: {
        meterStatusId: Number(createForwardDto.meterStatusId),
      },
    });

    return await tx.userAcceptMeter.create({
      data: {
        meterId: Number(createForwardDto.meterId),
        userCallId: user.id,
      },
    });
  });
}
