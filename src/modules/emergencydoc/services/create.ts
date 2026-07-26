import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateEmergencydocDto } from '../dto/create-emergencydoc.dto';
import * as fs from 'fs';
import * as path from 'path';

async function deleteUploadedFile(filename?: string) {
  if (!filename) return;

  const filePath = path.resolve(
    process.env.UPLOAD_BASE_PATH || '',
    'emergency',
    filename,
  );

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error(`Error deleting uploaded file at ${filePath}:`, err);
  }
}

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

export async function createEmergencyDoc(
  prisma: PrismaService,
  user: AuthUser,
  createEmergencydocDto: CreateEmergencydocDto,
) {
  try {
    const useTime = calculateUseTime(
      createEmergencydocDto.startTime,
      createEmergencydocDto.endTime,
    );

    return await prisma.emergencyDoc.create({
      data: {
        ...createEmergencydocDto,
        emergencyDate: new Date(createEmergencydocDto.emergencyDate),
        startTime: createEmergencydocDto.startTime,
        endTime: createEmergencydocDto.endTime,
        useTime,
        lat: Number(createEmergencydocDto.lat),
        lng: Number(createEmergencydocDto.lng),
        emergencyImg: createEmergencydocDto.emergencyImg || '',
        emergencyAudio: createEmergencydocDto.emergencyAudio || '',
        provinceId: user.provinceId ? Number(user.provinceId) : null,
        districtId: user.districtId ? Number(user.districtId) : null,
        createdById: user.id,
      },
    });
  } catch (error) {
    await deleteUploadedFile(createEmergencydocDto?.emergencyImg);
    await deleteUploadedFile(createEmergencydocDto?.emergencyAudio);
    throw error;
  }
}
