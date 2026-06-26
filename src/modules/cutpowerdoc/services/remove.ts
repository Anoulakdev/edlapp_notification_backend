import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function removeCutpowerDoc(prisma: PrismaService, id: number) {
  const cutpower = await prisma.cutpowerDoc.findUnique({
    where: { id },
  });
  if (!cutpower) throw new NotFoundException('cutpower not found');

  if (cutpower.cutpowerFile) {
    const filePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'cutpower',
      cutpower.cutpowerFile,
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
    prisma.cutpowerAssign.deleteMany({
      where: { cutpowerId: id },
    }),

    // ✅ ลบ Assign
    prisma.cutpowerAddress.deleteMany({
      where: { cutpowerId: id },
    }),

    // ✅ ลบ MeetingDoc
    prisma.cutpowerDoc.delete({
      where: { id },
    }),
  ]);

  return {
    statusCode: HttpStatus.OK,
    message: 'cutpowerdoc deleted successfully',
  };
}
