import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';

export async function updateAssign(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateReceiverDto: UpdateReceiverDto,
) {
  return await prisma.$transaction(async (tx) => {
    const findProblemDoc = await tx.problemDoc.findUnique({
      where: { id },
      select: {
        createdAt: true,
      },
    });

    if (!findProblemDoc) {
      throw new Error('Problem is not found');
    }

    const now = new Date();
    const createdAt = new Date(findProblemDoc.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const sendTime = Math.floor(diffMs / (1000 * 60));

    // 1. Update the problemstatusId in the ProblemDoc table
    await tx.problemDoc.update({
      where: { id },
      data: {
        branchId: updateReceiverDto.branchId
          ? Number(updateReceiverDto.branchId)
          : undefined,
        repairDistrictId: updateReceiverDto.repairDistrictId
          ? Number(updateReceiverDto.repairDistrictId)
          : undefined,
      },
    });

    // 2. Create the ProblemAssign record
    return await tx.problemAssign.update({
      where: { problemId: Number(id) },
      data: {
        userSendId: user.id,
        sendAt: now,
        sendTime: sendTime > 0 ? sendTime : 0,
      },
    });
  });
}
