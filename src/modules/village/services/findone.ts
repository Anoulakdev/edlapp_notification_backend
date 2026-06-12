import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneVillage(prisma: PrismaService, id: number) {
  const village = await prisma.village.findUnique({
    where: { id },
    include: {
      district: true,
    },
  });
  if (!village) throw new NotFoundException('village not found');
  return village;
}
