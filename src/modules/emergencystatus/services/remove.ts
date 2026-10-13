import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function removeEmergencyStatus(prisma: PrismaService, id: number) {
  const emergencyStatus = await prisma.emergencyStatus.findUnique({
    where: { id },
  });
  if (!emergencyStatus)
    throw new NotFoundException('emergencyStatus not found');

  await prisma.emergencyStatus.delete({ where: { id } });
  MemoryCache.delete('select:emergency_statuses');
  return {
    statusCode: HttpStatus.OK,
    message: 'emergencyStatus deleted successfully',
  };
}
