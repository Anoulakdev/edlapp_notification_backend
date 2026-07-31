import { PrismaService } from '../../../prisma/prisma.service';
// import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateTurnoffdocDto } from '../dto/update-turnoffdoc.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

function calculateTurnoffUseTime(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  startTime?: string | null,
  endTime?: string | null,
): number {
  if (!startDate || !endDate || !startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return 0;
  }

  let dailyMinutes = endH * 60 + endM - (startH * 60 + startM);
  if (dailyMinutes < 0) {
    dailyMinutes += 24 * 60;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return dailyMinutes;
  }

  const startMs = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const endMs = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );

  const dayDiff = Math.max(
    1,
    Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1,
  );

  return dailyMinutes * dayDiff;
}

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

  const finalStartDate = updateTurnoffdocDto.startDate || turnoff.startDate;
  const finalEndDate = updateTurnoffdocDto.endDate || turnoff.endDate;
  const finalStartTime = updateTurnoffdocDto.startTime || turnoff.startTime;
  const finalEndTime = updateTurnoffdocDto.endTime || turnoff.endTime;

  const useTime = calculateTurnoffUseTime(
    finalStartDate,
    finalEndDate,
    finalStartTime,
    finalEndTime,
  );

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
      useTime,
      turnoffFile: updateTurnoffdocDto.turnoffFile,
    },
  });
}
