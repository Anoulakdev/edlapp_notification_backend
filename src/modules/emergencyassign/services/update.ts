import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateEmergencyassignDto } from '../dto/update-emergencyassign.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateEmergencyAssign(
  prisma: PrismaService,
  id: number,
  updateEmergencyassignDto: UpdateEmergencyassignDto,
) {
  const emergencyAssign = await prisma.emergencyAssign.findUnique({
    where: { id },
  });
  if (!emergencyAssign)
    throw new NotFoundException('emergencyAssign not found');

  return await prisma.emergencyAssign.update({
    where: { id },
    data: {
      docview: updateEmergencyassignDto.docview,
    },
  });
}
