import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function removeActivity(prisma: PrismaService, id: number) {
  const activity = await prisma.activity.findUnique({
    where: { id },
  });
  if (!activity) throw new NotFoundException('activity not found');

  if (activity.actFile) {
    const filePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'activity',
      activity.actFile,
    );

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting image:', err);
          }
        });
      }
    });
  }

  await prisma.activity.delete({
    where: { id },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'activity deleted successfully',
  };
}
