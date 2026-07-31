import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateTurnoffdocDto } from '../dto/create-turnoffdoc.dto';
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

export async function createTurnoffDoc(
  prisma: PrismaService,
  user: AuthUser,
  createTurnoffdocDto: CreateTurnoffdocDto,
  Docfilename: string,
) {
  try {
    const useTime = calculateTurnoffUseTime(
      createTurnoffdocDto.startDate,
      createTurnoffdocDto.endDate,
      createTurnoffdocDto.startTime,
      createTurnoffdocDto.endTime,
    );

    return await prisma.turnoffDoc.create({
      data: {
        ...createTurnoffdocDto,
        startDate: new Date(createTurnoffdocDto.startDate),
        endDate: new Date(createTurnoffdocDto.endDate),
        startTime: createTurnoffdocDto.startTime,
        endTime: createTurnoffdocDto.endTime,
        useTime,
        turnoffFile: Docfilename,
        provinceId: user.provinceId ? Number(user.provinceId) : null,
        districtId: user.districtId ? Number(user.districtId) : null,
        createdById: user.id,
      },
    });
  } catch (error) {
    if (Docfilename) {
      const filePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'turnoff',
        Docfilename,
      );

      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        await fs.promises.unlink(filePath);
      } catch (fsError) {
        console.error('Error deleting uploaded icon:', fsError);
      }
    }
    throw error;
  }
}
