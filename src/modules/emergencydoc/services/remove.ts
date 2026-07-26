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

export async function removeEmergencyDoc(prisma: PrismaService, id: number) {
  return await prisma.$transaction(async (tx) => {
    const emergencyDoc = await tx.emergencyDoc.findUnique({
      where: { id },
    });
    if (!emergencyDoc) throw new NotFoundException('emergencyDoc not found');

    if (emergencyDoc.emergencyImg) {
      await deleteFileIfExists('emergency', emergencyDoc.emergencyImg);
    }
    if (emergencyDoc.emergencyAudio) {
      await deleteFileIfExists('emergency', emergencyDoc.emergencyAudio);
    }

    await tx.emergencyAssign.deleteMany({
      where: { emergencyId: id },
    });

    await tx.emergencyAddress.deleteMany({
      where: { emergencyId: id },
    });

    await tx.emergencyDoc.delete({
      where: { id },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'emergencyDoc deleted successfully',
    };
  });
}
