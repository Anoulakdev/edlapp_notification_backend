import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';
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

  if (updateReceiverDto.commentAudio) {
    if (oldFileAudio && updateReceiverDto.commentAudio !== oldFileAudio) {
      const oldFilePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'audio',
        oldFileAudio,
      );

      fs.access(oldFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old audio:', err);
            }
          });
        }
      });
    }
  } else {
    updateReceiverDto.commentAudio = oldFileAudio || undefined;
  }

  if (updateReceiverDto.commentImg) {
    if (oldFileImg && updateReceiverDto.commentImg !== oldFileImg) {
      const oldFilePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'comment',
        oldFileImg,
      );

      fs.access(oldFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old image:', err);
            }
          });
        }
      });
    }
  } else {
    updateReceiverDto.commentImg = oldFileImg || undefined;
  }

  return await prisma.$transaction(async (tx) => {
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
    const receiveAt = new Date(problemassign.receiveAt!);
    const diffMs = now.getTime() - receiveAt.getTime();
    const activeTime = Math.floor(diffMs / (1000 * 60));

    // 2. Update the ProblemAssign table
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
    });
  });
}
