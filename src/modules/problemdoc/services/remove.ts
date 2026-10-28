import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function deleteFileIfExists(
  dirName: string,
  fileName: string | null | undefined,
) {
  if (!fileName) return;
  const filePath = path.resolve(
    process.env.UPLOAD_BASE_PATH || '',
    dirName,
    fileName,
  );
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
}

export async function removeProblemDoc(prisma: PrismaService, id: number) {
  const filesToDelete = await prisma.$transaction(async (tx) => {
    const problemdoc = await tx.problemDoc.findUnique({
      where: { id },
      include: {
        problemAssigns: true,
      },
    });
    if (!problemdoc) throw new NotFoundException('problemDoc not found');

    const assign = problemdoc.problemAssigns;
    if (assign) {
      await tx.problemEquipment.deleteMany({
        where: { problemAssignId: assign.id },
      });
    }

    await tx.problemDoc.updateMany({
      where: { parentProblemId: id },
      data: { parentProblemId: null },
    });

    await tx.problemAssign.deleteMany({
      where: { problemId: id },
    });

    await tx.problemDoc.delete({
      where: { id },
    });

    return {
      commentAudio: assign?.commentAudio,
      commentImg: assign?.commentImg,
      problemImg: problemdoc.problemImg,
    };
  });

  await Promise.all([
    deleteFileIfExists('audio', filesToDelete.commentAudio),
    deleteFileIfExists('comment', filesToDelete.commentImg),
    deleteFileIfExists('problem', filesToDelete.problemImg),
  ]);

  return {
    statusCode: HttpStatus.OK,
    message: 'problemDoc deleted successfully',
  };
}
