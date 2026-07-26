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
  return await prisma.$transaction(async (tx) => {
    const problemdoc = await tx.problemDoc.findUnique({
      where: { id },
      include: {
        problemAssigns: true,
      },
    });
    if (!problemdoc) throw new NotFoundException('problemDoc not found');

    const assign = problemdoc.problemAssigns;
    if (assign) {
      await deleteFileIfExists('audio', assign.commentAudio);
      await deleteFileIfExists('comment', assign.commentImg);
    }

    await deleteFileIfExists('problem', problemdoc.problemImg);

    await tx.problemAssign.deleteMany({
      where: { problemId: id },
    });

    await tx.problemDoc.delete({
      where: { id },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'problemDoc deleted successfully',
    };
  });
}
