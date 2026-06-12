import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateEmergencydocDto } from '../dto/create-emergencydoc.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function createEmergencyDoc(
  prisma: PrismaService,
  user: AuthUser,
  createEmergencydocDto: CreateEmergencydocDto,
  Docfilename: string,
) {
  try {
    return await prisma.emergencyDoc.create({
      data: {
        ...createEmergencydocDto,
        emergencyDate: new Date(createEmergencydocDto.emergencyDate),
        startTime: createEmergencydocDto.startTime,
        endTime: createEmergencydocDto.endTime,
        lat: Number(createEmergencydocDto.lat),
        lng: Number(createEmergencydocDto.lng),
        emergencyImg: Docfilename,
        provinceId: user.provinceId ? Number(user.provinceId) : null,
        districtId: user.districtId ? Number(user.districtId) : null,
        createdById: user.id,
      },
    });
  } catch (error) {
    if (Docfilename) {
      const filePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'emergency',
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
