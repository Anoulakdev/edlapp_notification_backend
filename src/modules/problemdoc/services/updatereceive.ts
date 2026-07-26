import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';

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
      throw new Error('ProblemAssign is not found');
    }

    const now = new Date();
    const sendAt = new Date(findProblemAssign.sendAt!);
    const diffMs = now.getTime() - sendAt.getTime();
    const receiveTime = Math.floor(diffMs / (1000 * 60));

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
