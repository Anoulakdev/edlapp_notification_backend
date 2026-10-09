import { PrismaService } from '../../../prisma/prisma.service';
// import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateActivityDto } from '../dto/update-activity.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function updateActivity(
  prisma: PrismaService,
  id: number,
  updateActivityDto: UpdateActivityDto,
) {
  const activity = await prisma.activity.findUnique({
    where: { id },
  });
  if (!activity) throw new NotFoundException('activity not found');

  const oldFile = activity.actFile || '';

  if (updateActivityDto.actFile && updateActivityDto.actFile !== oldFile) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'activity',
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
    updateActivityDto.actFile = oldFile;
  }

  return await prisma.activity.update({
    where: { id },
    data: {
      title:
        updateActivityDto.title !== undefined
          ? updateActivityDto.title
          : undefined,
      content:
        updateActivityDto.content !== undefined
          ? updateActivityDto.content
          : undefined,
      location:
        updateActivityDto.location !== undefined
          ? updateActivityDto.location
          : undefined,
      startDate: updateActivityDto.startDate
        ? new Date(updateActivityDto.startDate)
        : undefined,
      endDate: updateActivityDto.endDate
        ? new Date(updateActivityDto.endDate)
        : undefined,
      actFile: updateActivityDto.actFile,
    },
  });
}
