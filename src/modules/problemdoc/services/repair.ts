import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';
import { ProblemEquipmentItemDto } from '../dto/problem-equipment.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import * as fs from 'fs';
import * as path from 'path';

export async function updateRepair(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateReceiverDto: UpdateReceiverDto,
) {
  const problemassign = await prisma.problemAssign.findUnique({
    where: { problemId: Number(id) },
  });
  if (!problemassign) throw new NotFoundException('problemAssign not found');

  const oldFileAudio = problemassign.commentAudio || '';
  const oldFileImg = problemassign.commentImg || '';

  const filesToDelete: string[] = [];

  if (updateReceiverDto.commentAudio) {
    if (oldFileAudio && updateReceiverDto.commentAudio !== oldFileAudio && process.env.UPLOAD_BASE_PATH) {
      filesToDelete.push(
        path.resolve(process.env.UPLOAD_BASE_PATH, 'audio', oldFileAudio),
      );
    }
  } else {
    updateReceiverDto.commentAudio = oldFileAudio || undefined;
  }

  if (updateReceiverDto.commentImg) {
    if (oldFileImg && updateReceiverDto.commentImg !== oldFileImg && process.env.UPLOAD_BASE_PATH) {
      filesToDelete.push(
        path.resolve(process.env.UPLOAD_BASE_PATH, 'comment', oldFileImg),
      );
    }
  } else {
    updateReceiverDto.commentImg = oldFileImg || undefined;
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update the problemstatusId in the ProblemDoc table
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

    const now = new Date();
    const receiveAt = problemassign.receiveAt
      ? new Date(problemassign.receiveAt)
      : null;
    const diffMs = receiveAt ? now.getTime() - receiveAt.getTime() : 0;
    const activeTime = Math.floor(diffMs / (1000 * 60));

    // 2. Handle ProblemEquipments if provided
    const rawEquipments =
      updateReceiverDto.problemEquipments ?? updateReceiverDto.equipments;

    if (rawEquipments !== undefined && rawEquipments !== null) {
      let equipmentsList: unknown = rawEquipments;
      if (typeof equipmentsList === 'string') {
        try {
          equipmentsList = JSON.parse(equipmentsList) as unknown;
        } catch {
          equipmentsList = [];
        }
      }
      if (
        !Array.isArray(equipmentsList) &&
        typeof equipmentsList === 'object' &&
        equipmentsList !== null
      ) {
        equipmentsList = [equipmentsList];
      }

      if (Array.isArray(equipmentsList)) {
        // Delete old equipments for this problemAssign
        await tx.problemEquipment.deleteMany({
          where: { problemAssignId: Number(problemassign.id) },
        });

        // Insert new equipments if array has items
        if (equipmentsList.length > 0) {
          const itemsToInsert = (
            equipmentsList as Array<Partial<ProblemEquipmentItemDto>>
          ).map((item) => ({
            problemAssignId: Number(problemassign.id),
            typeEquipmentId: Number(item.typeEquipmentId),
            equipmentId: Number(item.equipmentId),
            amount: Number(item.amount),
            typeUnitId: Number(item.typeUnitId),
            comment: item.comment ? String(item.comment) : null,
          }));

          await tx.problemEquipment.createMany({
            data: itemsToInsert,
          });
        }
      }
    }

    // 3. Update the ProblemAssign table
    return await tx.problemAssign.update({
      where: { id: Number(problemassign.id) },
      data: {
        userActiveId: user.id,
        activeAt: now,
        activeTime: activeTime > 0 ? activeTime : 0,
        commentText:
          updateReceiverDto.commentText !== undefined
            ? updateReceiverDto.commentText || null
            : undefined,
        commentAudio:
          updateReceiverDto.commentAudio !== undefined
            ? updateReceiverDto.commentAudio || null
            : undefined,
        commentImg:
          updateReceiverDto.commentImg !== undefined
            ? updateReceiverDto.commentImg || null
            : undefined,
      },
      include: {
        problemEquipments: {
          include: {
            typeEquipment: {
              select: {
                id: true,
                name: true,
              },
            },
            equipment: {
              select: {
                id: true,
                name: true,
              },
            },
            typeUnit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  });

  // Only delete old files if transaction succeeded
  for (const filePath of filesToDelete) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting old file:', unlinkErr);
          }
        });
      }
    });
  }

  return result;
}
