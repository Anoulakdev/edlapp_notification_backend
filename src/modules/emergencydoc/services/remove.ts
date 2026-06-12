import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function removeEmergencyDoc(prisma: PrismaService, id: number) {
  const emergencyDoc = await prisma.emergencyDoc.findUnique({
    where: { id },
  });
  if (!emergencyDoc) throw new NotFoundException('emergencyDoc not found');

  if (emergencyDoc.emergencyImg) {
    const filePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'emergency',
      emergencyDoc.emergencyImg,
    );

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting image:', err);
          }
        });
      }
    });
  }

  await prisma.$transaction([
    // ✅ ลบ DetailDoc
    prisma.emergencyAssign.deleteMany({
      where: { emergencyId: id },
    }),

    // ✅ ลบ Assign
    prisma.emergencyAddress.deleteMany({
      where: { emergencyId: id },
    }),

    // ✅ ลบ MeetingDoc
    prisma.emergencyDoc.delete({
      where: { id },
    }),
  ]);

  return {
    statusCode: HttpStatus.OK,
    message: 'emergencyDoc deleted successfully',
  };
}
