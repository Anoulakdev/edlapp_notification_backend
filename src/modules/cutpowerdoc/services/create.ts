import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateCutpowerdocDto } from '../dto/create-cutpowerdoc.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function createCutpowerDoc(
  prisma: PrismaService,
  user: AuthUser,
  createCutpowerdocDto: CreateCutpowerdocDto,
  Docfilename: string,
) {
  try {
    return await prisma.cutpowerDoc.create({
      data: {
        ...createCutpowerdocDto,
        cutpowerDate: new Date(createCutpowerdocDto.cutpowerDate),
        cutpowerFile: Docfilename,
        provinceId: user.provinceId ? Number(user.provinceId) : null,
        districtId: user.districtId ? Number(user.districtId) : null,
        createdById: user.id,
      },
    });
  } catch (error) {
    if (Docfilename) {
      const filePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'cutpower',
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
