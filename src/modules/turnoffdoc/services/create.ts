import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateTurnoffdocDto } from '../dto/create-turnoffdoc.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function createTurnoffDoc(
  prisma: PrismaService,
  user: AuthUser,
  createTurnoffdocDto: CreateTurnoffdocDto,
  Docfilename: string,
) {
  try {
    return await prisma.turnoffDoc.create({
      data: {
        ...createTurnoffdocDto,
        startDate: new Date(createTurnoffdocDto.startDate),
        endDate: new Date(createTurnoffdocDto.endDate),
        startTime: createTurnoffdocDto.startTime,
        endTime: createTurnoffdocDto.endTime,
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
