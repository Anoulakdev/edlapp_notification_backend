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
  const newlyUploadedFiles: string[] = [];
  if (updateReceiverDto.commentAudio && process.env.UPLOAD_BASE_PATH) {
    newlyUploadedFiles.push(
      path.resolve(
        process.env.UPLOAD_BASE_PATH,
        'audio',
        updateReceiverDto.commentAudio,
      ),
    );
  }
  if (updateReceiverDto.commentImg && process.env.UPLOAD_BASE_PATH) {
    newlyUploadedFiles.push(
      path.resolve(
        process.env.UPLOAD_BASE_PATH,
        'comment',
        updateReceiverDto.commentImg,
      ),
    );
  }

  const cleanupFiles = (paths: string[]) => {
    for (const filePath of paths) {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting file:', unlinkErr);
            }
          });
        }
      });
    }
  };

  const problemassign = await prisma.problemAssign.findUnique({
    where: { problemId: Number(id) },
  });
  if (!problemassign) {
    cleanupFiles(newlyUploadedFiles);
    throw new NotFoundException('problemAssign not found');
  }

  const oldFileAudio = problemassign.commentAudio || '';
  const oldFileImg = problemassign.commentImg || '';

  const filesToDelete: string[] = [];

  if (updateReceiverDto.commentAudio) {
    if (
      oldFileAudio &&
      updateReceiverDto.commentAudio !== oldFileAudio &&
      process.env.UPLOAD_BASE_PATH
    ) {
      filesToDelete.push(
        path.resolve(process.env.UPLOAD_BASE_PATH, 'audio', oldFileAudio),
      );
    }
  } else {
    updateReceiverDto.commentAudio = oldFileAudio || undefined;
  }

  if (updateReceiverDto.commentImg) {
    if (
      oldFileImg &&
      updateReceiverDto.commentImg !== oldFileImg &&
      process.env.UPLOAD_BASE_PATH
    ) {
      filesToDelete.push(
        path.resolve(process.env.UPLOAD_BASE_PATH, 'comment', oldFileImg),
      );
    }
  } else {
    updateReceiverDto.commentImg = oldFileImg || undefined;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const receiveAt = problemassign.receiveAt
        ? new Date(problemassign.receiveAt)
        : null;
      const diffMs = receiveAt ? now.getTime() - receiveAt.getTime() : 0;
      const activeTime = Math.floor(diffMs / (1000 * 60));

      // 1. Update the problemstatusId in the ProblemDoc table
      if (
        updateReceiverDto.problemstatusId !== undefined &&
        updateReceiverDto.problemstatusId !== null
      ) {
        const targetStatusId = Number(updateReceiverDto.problemstatusId);
        const updatedParent = await tx.problemDoc.update({
          where: { id: Number(id) },
          data: {
            problemstatusId: targetStatusId,
          },
          select: {
            id: true,
            branchId: true,
            repairDistrictId: true,
          },
        });

        // When repair is completed (problemstatusId = 4), update linked duplicateProblems as well
        if (targetStatusId === 4) {
          await tx.problemDoc.updateMany({
            where: { parentProblemId: Number(id) },
            data: {
              problemstatusId: 4,
              ...(updatedParent.branchId
                ? { branchId: updatedParent.branchId }
                : {}),
              ...(updatedParent.repairDistrictId
                ? { repairDistrictId: updatedParent.repairDistrictId }
                : {}),
            },
          });

          // Single query using relation filter to update active status on ProblemAssign for duplicates
          await tx.problemAssign.updateMany({
            where: {
              problem: { parentProblemId: Number(id) },
              userActiveId: null,
            },
            data: {
              userActiveId: user.id,
              activeAt: now,
              activeTime: activeTime > 0 ? activeTime : 0,
            },
          });
        }
      }

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

          // Insert new equipments if array has valid items
          if (equipmentsList.length > 0) {
            const itemsToInsert = (
              equipmentsList as Array<Partial<ProblemEquipmentItemDto>>
            )
              .filter(
                (item) =>
                  item &&
                  item.equipmentId &&
                  !isNaN(Number(item.equipmentId)) &&
                  Number(item.amount) > 0,
              )
              .map((item) => ({
                problemAssignId: Number(problemassign.id),
                equipmentId: Number(item.equipmentId),
                amount: Number(item.amount),
                comment: item.comment ? String(item.comment) : null,
              }));

            if (itemsToInsert.length > 0) {
              await tx.problemEquipment.createMany({
                data: itemsToInsert,
              });
            }
          }
        }
      }

      const rawCarRepair = updateReceiverDto.carRepair as unknown;
      const parsedCarRepair =
        rawCarRepair === undefined
          ? undefined
          : rawCarRepair === true ||
            rawCarRepair === 'true' ||
            rawCarRepair === 1 ||
            rawCarRepair === '1';

      // 3. Update the ProblemAssign table
      return await tx.problemAssign.update({
        where: { id: Number(problemassign.id) },
        data: {
          userActiveId: user.id,
          activeAt: now,
          activeTime: activeTime > 0 ? activeTime : 0,
          voltageId:
            updateReceiverDto.voltageId !== undefined
              ? updateReceiverDto.voltageId
                ? Number(updateReceiverDto.voltageId)
                : null
              : undefined,
          typeRepairId:
            updateReceiverDto.typeRepairId !== undefined
              ? updateReceiverDto.typeRepairId
                ? Number(updateReceiverDto.typeRepairId)
                : null
              : undefined,
          carRepair: parsedCarRepair,
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
          voltage: {
            select: {
              id: true,
              name: true,
            },
          },
          typeRepair: {
            select: {
              id: true,
              name: true,
            },
          },
          problemEquipments: {
            include: {
              equipment: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
    });

    // Only delete old files if transaction succeeded
    cleanupFiles(filesToDelete);

    return result;
  } catch (error) {
    cleanupFiles(newlyUploadedFiles);
    throw error;
  }
}
