import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProblemdocDto } from '../dto/update-problemdoc.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function updateProblemDoc(
  prisma: PrismaService,
  id: number,
  updateProblemdocDto: UpdateProblemdocDto,
) {
  const problemdoc = await prisma.problemDoc.findUnique({
    where: { id },
  });
  if (!problemdoc) throw new NotFoundException('problemDoc not found');

  const oldFile = problemdoc.problemImg || '';
  const hasNewFile = Boolean(
    updateProblemdocDto.problemImg &&
      updateProblemdocDto.problemImg !== oldFile,
  );

  if (!hasNewFile) {
    updateProblemdocDto.problemImg = oldFile || undefined;
  }

  const updated = await prisma.problemDoc.update({
    where: { id },
    data: {
      ...updateProblemdocDto,
      problemImg: updateProblemdocDto.problemImg || null,
      problemtypeId:
        updateProblemdocDto.problemtypeId !== undefined &&
        updateProblemdocDto.problemtypeId !== null
          ? Number(updateProblemdocDto.problemtypeId)
          : undefined,
      lat:
        updateProblemdocDto.lat !== undefined &&
        updateProblemdocDto.lat !== null
          ? Number(updateProblemdocDto.lat)
          : undefined,
      lng:
        updateProblemdocDto.lng !== undefined &&
        updateProblemdocDto.lng !== null
          ? Number(updateProblemdocDto.lng)
          : undefined,
      provinceId:
        updateProblemdocDto.provinceId !== undefined &&
        updateProblemdocDto.provinceId !== null
          ? Number(updateProblemdocDto.provinceId)
          : undefined,
      districtId:
        updateProblemdocDto.districtId !== undefined &&
        updateProblemdocDto.districtId !== null
          ? Number(updateProblemdocDto.districtId)
          : undefined,
      villageId:
        updateProblemdocDto.villageId !== undefined &&
        updateProblemdocDto.villageId !== null
          ? Number(updateProblemdocDto.villageId)
          : undefined,
      parentProblemId:
        updateProblemdocDto.parentProblemId !== undefined
          ? updateProblemdocDto.parentProblemId
            ? Number(updateProblemdocDto.parentProblemId)
            : null
          : undefined,
    },
  });

  if (hasNewFile && oldFile && process.env.UPLOAD_BASE_PATH) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH,
      'problem',
      oldFile,
    );

    fs.access(oldFilePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(oldFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting old icon:', unlinkErr);
          }
        });
      }
    });
  }

  return updated;
}
