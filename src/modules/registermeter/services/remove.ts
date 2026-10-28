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

export async function removeRegisterMeter(prisma: PrismaService, id: number) {
  const filesToDelete = await prisma.$transaction(async (tx) => {
    const registermeter = await tx.registerMeter.findUnique({
      where: { id },
    });
    if (!registermeter) throw new NotFoundException('registermeter not found');

    await tx.userAcceptMeter.deleteMany({
      where: { meterId: id },
    });

    await tx.registerMeter.delete({
      where: { id },
    });

    return {
      billNearImg: registermeter.billNearImg,
      idcardImg: registermeter.idcardImg,
    };
  });

  await Promise.all([
    deleteFileIfExists('registermeter', filesToDelete.billNearImg),
    deleteFileIfExists('registermeter', filesToDelete.idcardImg),
  ]);

  return {
    statusCode: HttpStatus.OK,
    message: 'registermeter deleted successfully',
  };
}
