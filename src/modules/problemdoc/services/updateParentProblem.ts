import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';

export async function updateParentProblemId(
  prisma: PrismaService,
  id: number,
  updateReceiverDto: UpdateReceiverDto,
) {
  const targetId = Number(id);
  if (!targetId || isNaN(targetId)) {
    throw new BadRequestException('id must be a valid number');
  }

  const problemdoc = await prisma.problemDoc.findUnique({
    where: { id: targetId },
  });

  if (!problemdoc) {
    throw new NotFoundException('problemDoc not found');
  }

  let parentProblemId: number | null = null;
  let inheritedBranchId: number | undefined;
  let inheritedRepairDistrictId: number | undefined;
  let parentStatusId: number | undefined;

  if (
    updateReceiverDto.parentProblemId !== undefined &&
    updateReceiverDto.parentProblemId !== null
  ) {
    parentProblemId = Number(updateReceiverDto.parentProblemId);

    if (isNaN(parentProblemId)) {
      throw new BadRequestException('parentProblemId must be a valid number');
    }

    if (parentProblemId === targetId) {
      throw new BadRequestException(
        'parentProblemId cannot be the same as the problem ID',
      );
    }

    let parentDoc = await prisma.problemDoc.findUnique({
      where: { id: parentProblemId },
    });

    if (!parentDoc) {
      throw new NotFoundException('Parent problemDoc not found');
    }

    // Prevent multi-level chain: if selected parent is already a child, link directly to root parent
    if (parentDoc.parentProblemId) {
      if (parentDoc.parentProblemId === targetId) {
        throw new BadRequestException(
          'Circular parentProblemId reference is not allowed',
        );
      }
      parentProblemId = parentDoc.parentProblemId;
      const rootDoc = await prisma.problemDoc.findUnique({
        where: { id: parentProblemId },
      });
      if (rootDoc) {
        parentDoc = rootDoc;
      }
    }

    if (parentDoc.branchId) {
      inheritedBranchId = parentDoc.branchId;
    }
    if (parentDoc.repairDistrictId) {
      inheritedRepairDistrictId = parentDoc.repairDistrictId;
    }
    parentStatusId = parentDoc.problemstatusId;
  }

  const dataToUpdate: {
    parentProblemId: number | null;
    problemstatusId?: number;
    branchId?: number;
    repairDistrictId?: number;
  } = {
    parentProblemId,
    ...(inheritedBranchId ? { branchId: inheritedBranchId } : {}),
    ...(inheritedRepairDistrictId
      ? { repairDistrictId: inheritedRepairDistrictId }
      : {}),
  };

  if (parentStatusId === 4) {
    dataToUpdate.problemstatusId = 4;
  } else if (
    updateReceiverDto.problemstatusId !== undefined &&
    updateReceiverDto.problemstatusId !== null &&
    !isNaN(Number(updateReceiverDto.problemstatusId))
  ) {
    dataToUpdate.problemstatusId = Number(updateReceiverDto.problemstatusId);
  }

  return prisma.problemDoc.update({
    where: { id: targetId },
    data: dataToUpdate,
  });
}

export const updateParentProblem = updateParentProblemId;
