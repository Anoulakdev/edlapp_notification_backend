import { PrismaService } from '../../../prisma/prisma.service';
// import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateEmergencydocDto } from '../dto/update-emergencydoc.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function updateEmergencyDoc(
  prisma: PrismaService,
  id: number,
  updateEmergencydocDto: UpdateEmergencydocDto,
) {
  const emergencydoc = await prisma.emergencyDoc.findUnique({
    where: { id },
  });
  if (!emergencydoc) throw new NotFoundException('emergencydoc not found');

  const oldFile = emergencydoc.emergencyImg || '';

  if (
    updateEmergencydocDto.emergencyImg &&
    updateEmergencydocDto.emergencyImg !== oldFile
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'emergency',
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
    updateEmergencydocDto.emergencyImg = oldFile;
  }

  return await prisma.emergencyDoc.update({
    where: { id },
    data: {
      ...updateEmergencydocDto,
      emergencyDate: updateEmergencydocDto.emergencyDate
        ? new Date(updateEmergencydocDto.emergencyDate)
        : undefined,
      startTime: updateEmergencydocDto.startTime,
      endTime: updateEmergencydocDto.endTime,
      lat: Number(updateEmergencydocDto.lat),
      lng: Number(updateEmergencydocDto.lng),
      emergencyImg: updateEmergencydocDto.emergencyImg,
    },
  });
}
