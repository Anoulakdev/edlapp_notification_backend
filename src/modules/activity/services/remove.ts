import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function removeActivity(prisma: PrismaService, id: number) {
  const activity = await prisma.activity.findUnique({
    where: { id },
  });
  if (!activity) throw new NotFoundException('activity not found');

  await prisma.activity.delete({
    where: { id },
  });

  if (activity.actFile) {
    const filePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'activity',
      activity.actFile,
    );

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'activity deleted successfully',
  };
}
