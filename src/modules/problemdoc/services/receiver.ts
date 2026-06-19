import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateReceiverDto } from '../dto/create-receiver.dto';

export async function createReceiver(
  prisma: PrismaService,
  user: AuthUser,
  createReceiverDto: CreateReceiverDto,
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update the problemstatusId in the ProblemDoc table
    await tx.problemDoc.update({
      where: { id: Number(createReceiverDto.problemId) },
      data: {
        problemstatusId: Number(createReceiverDto.problemstatusId),
      },
    });

    // 2. Create the ProblemAssign record
    return await tx.problemAssign.create({
      data: {
        problemId: Number(createReceiverDto.problemId),
        userReceiverId: user.id,
      },
    });
  });
}
