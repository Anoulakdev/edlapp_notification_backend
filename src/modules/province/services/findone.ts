import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneProvince(prisma: PrismaService, id: number) {
  const province = await prisma.province.findUnique({ where: { id } });
  if (!province) throw new NotFoundException('province not found');
  return province;
}
