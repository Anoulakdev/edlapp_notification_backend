import { PrismaService } from '../../../prisma/prisma.service';
// import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateCutpowerdocDto } from '../dto/update-cutpowerdoc.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function updateCutpowerDoc(
  prisma: PrismaService,
  id: number,
  updateCutpowerdocDto: UpdateCutpowerdocDto,
) {
  const cutpower = await prisma.cutpowerDoc.findUnique({
    where: { id },
  });
  if (!cutpower) throw new NotFoundException('cutpower not found');

  const oldFile = cutpower.cutpowerFile || '';

  if (
    updateCutpowerdocDto.cutpowerFile &&
    updateCutpowerdocDto.cutpowerFile !== oldFile
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'cutpower',
      oldFile,
    );

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่ก่อนจะลบ
    fs.access(oldFilePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error('Error deleting old icon:', err);
          }
        });
      }
    });
  } else {
    // ✅ ถ้าไม่มีรูปใหม่ ให้ใช้รูปเก่า
    updateCutpowerdocDto.cutpowerFile = oldFile;
  }

  return await prisma.cutpowerDoc.update({
    where: { id },
    data: {
      ...updateCutpowerdocDto,
      cutpowerDate: updateCutpowerdocDto.cutpowerDate
        ? new Date(updateCutpowerdocDto.cutpowerDate)
        : undefined,
      cutpowerFile: updateCutpowerdocDto.cutpowerFile,
    },
  });
}
