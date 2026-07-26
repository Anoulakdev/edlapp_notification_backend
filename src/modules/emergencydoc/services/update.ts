import { PrismaService } from '../../../prisma/prisma.service';
// import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateEmergencydocDto } from '../dto/update-emergencydoc.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

function calculateUseTime(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return 0;
  }

  let diff = endH * 60 + endM - (startH * 60 + startM);
  if (diff < 0) {
    diff += 24 * 60;
  }
  return diff;
}

export async function updateEmergencyDoc(
  prisma: PrismaService,
  id: number,
  updateEmergencydocDto: UpdateEmergencydocDto,
) {
  const emergencydoc = await prisma.emergencyDoc.findUnique({
    where: { id },
  });
  if (!emergencydoc) throw new NotFoundException('emergencydoc not found');

  const oldEmergencyImg = emergencydoc.emergencyImg || '';

  if (
    updateEmergencydocDto.emergencyImg &&
    updateEmergencydocDto.emergencyImg !== oldEmergencyImg
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'emergency',
      oldEmergencyImg,
    );

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
    updateEmergencydocDto.emergencyImg = oldEmergencyImg || undefined;
  }

  const oldEmergencyAudio = emergencydoc.emergencyAudio || '';

  if (
    updateEmergencydocDto.emergencyAudio &&
    updateEmergencydocDto.emergencyAudio !== oldEmergencyAudio
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'emergency',
      oldEmergencyAudio,
    );

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
    updateEmergencydocDto.emergencyAudio = oldEmergencyAudio || undefined;
  }

  const startTime =
    updateEmergencydocDto.startTime !== undefined
      ? updateEmergencydocDto.startTime
      : emergencydoc.startTime;
  const endTime =
    updateEmergencydocDto.endTime !== undefined
      ? updateEmergencydocDto.endTime
      : emergencydoc.endTime;
  const useTime = calculateUseTime(
    startTime || undefined,
    endTime || undefined,
  );

  return await prisma.emergencyDoc.update({
    where: { id },
    data: {
      ...updateEmergencydocDto,
      emergencyDate: updateEmergencydocDto.emergencyDate
        ? new Date(updateEmergencydocDto.emergencyDate)
        : undefined,
      startTime: updateEmergencydocDto.startTime,
      endTime: updateEmergencydocDto.endTime,
      useTime,
      lat: Number(updateEmergencydocDto.lat),
      lng: Number(updateEmergencydocDto.lng),
      emergencyImg: updateEmergencydocDto.emergencyImg || null,
      emergencyAudio: updateEmergencydocDto.emergencyAudio || null,
    },
  });
}
