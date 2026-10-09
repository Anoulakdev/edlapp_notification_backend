import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateActivityDto } from '../dto/create-activity.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function createActivity(
  prisma: PrismaService,
  user: AuthUser,
  createActivityDto: CreateActivityDto,
  Docfilename: string,
) {
  try {
    return await prisma.activity.create({
      data: {
        title: createActivityDto.title,
        content: createActivityDto.content,
        location: createActivityDto.location,
        startDate: new Date(createActivityDto.startDate),
        endDate: new Date(createActivityDto.endDate),
        actFile: Docfilename,
        createdById: user.id,
      },
    });
  } catch (error) {
    if (Docfilename) {
      const filePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'activity',
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
