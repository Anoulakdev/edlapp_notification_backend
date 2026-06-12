import { PrismaService } from '../../../prisma/prisma.service';
// import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateTurnoffdocDto } from '../dto/update-turnoffdoc.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function updateTurnoffDoc(
  prisma: PrismaService,
  id: number,
  updateTurnoffdocDto: UpdateTurnoffdocDto,
) {
  const turnoff = await prisma.turnoffDoc.findUnique({
    where: { id },
  });
  if (!turnoff) throw new NotFoundException('turnoff not found');

  const oldFile = turnoff.turnoffFile || '';

  if (
    updateTurnoffdocDto.turnoffFile &&
    updateTurnoffdocDto.turnoffFile !== oldFile
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'turnoff',
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
    updateTurnoffdocDto.turnoffFile = oldFile;
  }

  return await prisma.turnoffDoc.update({
    where: { id },
    data: {
      ...updateTurnoffdocDto,
      startDate: updateTurnoffdocDto.startDate
        ? new Date(updateTurnoffdocDto.startDate)
        : undefined,
      endDate: updateTurnoffdocDto.endDate
        ? new Date(updateTurnoffdocDto.endDate)
        : undefined,
      startTime: updateTurnoffdocDto.startTime,
      endTime: updateTurnoffdocDto.endTime,
      turnoffFile: updateTurnoffdocDto.turnoffFile,
    },
  });
}
