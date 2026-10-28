import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateReceiverDto } from '../dto/create-receiver.dto';
import { sendFCM } from '../../../fcm/fcm.service';
import { NotFoundException } from '@nestjs/common';

export async function createAssign(
  prisma: PrismaService,
  user: AuthUser,
  createReceiverDto: CreateReceiverDto,
) {
  const result = await prisma.$transaction(async (tx) => {
    const targetProblemId = Number(createReceiverDto.problemId);
    const findProblemDoc = await tx.problemDoc.findUnique({
      where: { id: targetProblemId },
      select: {
        createdAt: true,
      },
    });

    if (!findProblemDoc) {
      throw new NotFoundException('Problem is not found');
    }

    const now = new Date();
    const createdAt = new Date(findProblemDoc.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const sendTime = Math.floor(diffMs / (1000 * 60));

    const branchIdVal = user.branchId ? Number(user.branchId) : undefined;
    const repairDistrictIdVal = createReceiverDto.repairDistrictId
      ? Number(createReceiverDto.repairDistrictId)
      : undefined;

    // 1. Update the problemstatusId in the ProblemDoc table
    const updatedProblemDoc = await tx.problemDoc.update({
      where: { id: targetProblemId },
      data: {
        problemstatusId: Number(createReceiverDto.problemstatusId),
        branchId: branchIdVal,
        repairDistrictId: repairDistrictIdVal,
      },
      include: {
        problemtype: true,
        village: true,
      },
    });

    // Propagate branchId & repairDistrictId to linked duplicate problems if any
    if (branchIdVal || repairDistrictIdVal) {
      await tx.problemDoc.updateMany({
        where: { parentProblemId: targetProblemId },
        data: {
          ...(branchIdVal ? { branchId: branchIdVal } : {}),
          ...(repairDistrictIdVal
            ? { repairDistrictId: repairDistrictIdVal }
            : {}),
        },
      });
    }

    // 2. Upsert the ProblemAssign record
    const assign = await tx.problemAssign.upsert({
      where: { problemId: targetProblemId },
      update: {
        userSendId: user.id,
        sendAt: now,
        sendTime: sendTime > 0 ? sendTime : 0,
      },
      create: {
        problemId: targetProblemId,
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
