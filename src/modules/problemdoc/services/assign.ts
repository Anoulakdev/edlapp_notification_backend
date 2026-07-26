import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateReceiverDto } from '../dto/create-receiver.dto';

export async function createAssign(
  prisma: PrismaService,
  user: AuthUser,
  createReceiverDto: CreateReceiverDto,
) {
  return await prisma.$transaction(async (tx) => {
    const findProblemDoc = await tx.problemDoc.findUnique({
      where: { id: Number(createReceiverDto.problemId) },
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
      where: { id: Number(createReceiverDto.problemId) },
      data: {
        problemstatusId: Number(createReceiverDto.problemstatusId),
        branchId: createReceiverDto.branchId
          ? Number(createReceiverDto.branchId)
          : undefined,
        repairDistrictId: createReceiverDto.repairDistrictId
          ? Number(createReceiverDto.repairDistrictId)
          : undefined,
      },
    });

    // 2. Create the ProblemAssign record
    return await tx.problemAssign.create({
      data: {
        problemId: Number(createReceiverDto.problemId),
        userSendId: user.id,
        sendAt: now,
        sendTime: sendTime > 0 ? sendTime : 0,
      },
    });
  });
}
