import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function removeTurnoffDoc(prisma: PrismaService, id: number) {
  const turnoff = await prisma.turnoffDoc.findUnique({
    where: { id },
  });
  if (!turnoff) throw new NotFoundException('turnoff not found');

  if (turnoff.turnoffFile) {
    const filePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'turnoff',
      turnoff.turnoffFile,
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
    prisma.turnoffAssign.deleteMany({
      where: { turnoffId: id },
    }),

    // ✅ ลบ Assign
    prisma.turnoffAddress.deleteMany({
      where: { turnoffId: id },
    }),

    // ✅ ลบ MeetingDoc
    prisma.turnoffDoc.delete({
      where: { id },
    }),
  ]);

  return {
    statusCode: HttpStatus.OK,
    message: 'turnoffdoc deleted successfully',
  };
}
