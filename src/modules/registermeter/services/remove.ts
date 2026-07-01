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
  return await prisma.$transaction(async (tx) => {
    const registermeter = await tx.registerMeter.findUnique({
      where: { id },
    });
    if (!registermeter) throw new NotFoundException('registermeter not found');

    if (registermeter.billNearImg) {
      await deleteFileIfExists('registermeter', registermeter.billNearImg);
    }
    if (registermeter.idcardImg) {
      await deleteFileIfExists('registermeter', registermeter.idcardImg);
    }

    await tx.userAcceptMeter.deleteMany({
      where: { meterId: id },
    });

    await tx.registerMeter.delete({
      where: { id },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'registermeter deleted successfully',
    };
  });
}
