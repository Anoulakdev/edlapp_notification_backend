import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateRepairdistrictDto } from '../dto/update-repairdistrict.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function updateRepairDistrict(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateRepairdistrictDto: UpdateRepairdistrictDto,
) {
  const repairdistrict = await prisma.repairDistrict.findUnique({
    where: { id },
  });
  if (!repairdistrict) throw new NotFoundException('repairdistrict not found');

  return prisma.repairDistrict.update({
    where: { id },
    data: {
      ...updateRepairdistrictDto,
      branchId: Number(updateRepairdistrictDto.branchId),
      createdById: user.id,
    },
  });
}
