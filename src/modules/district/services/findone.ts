import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneDistrict(prisma: PrismaService, id: number) {
  const district = await prisma.district.findUnique({
    where: { id },
    include: {
      province: true,
    },
  });
  if (!district) throw new NotFoundException('district not found');
  return district;
}
