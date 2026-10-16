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
  const isNewFile = Boolean(
    updateActivityDto.actFile && updateActivityDto.actFile !== oldFile,
  );

  if (!isNewFile) {
    updateActivityDto.actFile = oldFile;
  }

  try {
    const updated = await prisma.activity.update({
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
        facebookLink:
          updateActivityDto.facebookLink !== undefined
            ? updateActivityDto.facebookLink || null
            : undefined,
      },
    });

    // Delete old file only after database update succeeds
    if (isNewFile && oldFile) {
      const oldFilePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'activity',
        oldFile,
      );
      try {
        await fs.promises.access(oldFilePath, fs.constants.F_OK);
        await fs.promises.unlink(oldFilePath);
      } catch (fsErr) {
        // Old file might not exist on disk, ignore
      }
    }

    return updated;
  } catch (error) {
    // If update failed and a new file was uploaded, remove the new file to prevent disk leak
    if (isNewFile && updateActivityDto.actFile) {
      const newFilePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'activity',
        updateActivityDto.actFile,
      );
      try {
        await fs.promises.access(newFilePath, fs.constants.F_OK);
        await fs.promises.unlink(newFilePath);
      } catch (fsErr) {
        console.error('Error cleaning up newly uploaded file on error:', fsErr);
      }
    }
    throw error;
  }
}
