import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateReceiverDto } from '../dto/create-receiver.dto';
import { sendFCM } from '../../../fcm/fcm.service';

export async function createAssign(
  prisma: PrismaService,
  user: AuthUser,
  createReceiverDto: CreateReceiverDto,
) {
  const result = await prisma.$transaction(async (tx) => {
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
    const updatedProblemDoc = await tx.problemDoc.update({
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
      include: {
        problemtype: true,
        village: true,
      },
    });

    // 2. Create the ProblemAssign record
    const assign = await tx.problemAssign.create({
      data: {
        problemId: Number(createReceiverDto.problemId),
        userSendId: user.id,
        sendAt: now,
        sendTime: sendTime > 0 ? sendTime : 0,
      },
    });

    return { assign, updatedProblemDoc };
  });

  // Query FCM tokens of users in repairDistrictId and send notification
  const targetRepairDistrictId = result.updatedProblemDoc.repairDistrictId;

  if (targetRepairDistrictId) {
    const fcmRecords = await prisma.fcmToken.findMany({
      where: {
        user: {
          repairDistrictId: targetRepairDistrictId,
          status: 'A',
        },
      },
      select: {
        fcmtoken: true,
      },
    });

    const fcmTokens = Array.from(
      new Set(
        fcmRecords
          .map((r) => r.fcmtoken?.trim())
          .filter(
            (t): t is string =>
              Boolean(t) &&
              t.toLowerCase() !== 'demo' &&
              t.toLowerCase() !== 'null' &&
              t.toLowerCase() !== 'undefined',
          ),
      ),
    );

    if (fcmTokens.length) {
      const typeName = result.updatedProblemDoc.problemtype?.name;
      const title = 'ມີການມອບໝາຍວຽກສ້ອມແປງໃໝ່';
      const villageName = result.updatedProblemDoc.village?.village_name;
      const body = villageName
        ? `ປະເພດ: ${typeName} ບ້ານ: ${villageName}`
        : `ປະເພດ: ${typeName} ບ້ານ: .....`;

      sendFCM(fcmTokens, title, body, {
        problemId: String(result.assign.problemId),
      }).catch((fcmError) => {
        console.error(
          'Failed to send FCM notifications in background:',
          fcmError,
        );
      });
    }
  }

  return result.assign;
}
