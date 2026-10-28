import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateReceiver(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateReceiverDto: UpdateReceiverDto,
) {
  return await prisma.$transaction(async (tx) => {
    const findProblemAssign = await tx.problemAssign.findUnique({
      where: { problemId: Number(id) },
      select: {
        id: true,
        sendAt: true,
      },
    });

    if (!findProblemAssign) {
      throw new NotFoundException('ProblemAssign is not found');
    }

    const now = new Date();
    const sendAt = findProblemAssign.sendAt
      ? new Date(findProblemAssign.sendAt)
      : null;
    const diffMs = sendAt ? now.getTime() - sendAt.getTime() : 0;
    const receiveTime = diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;

    if (
      updateReceiverDto.problemstatusId !== undefined &&
      updateReceiverDto.problemstatusId !== null
    ) {
      await tx.problemDoc.update({
        where: { id: Number(id) },
        data: {
          problemstatusId: Number(updateReceiverDto.problemstatusId),
        },
      });
    }

    return await tx.problemAssign.update({
      where: { problemId: Number(id) },
      data: {
        userReceiverId: user.id,
        receiveAt: now,
        receiveTime: receiveTime > 0 ? receiveTime : 0,
      },
    });
  });
}
