import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateEmergencydocDto } from '../dto/update-emergencydoc.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  updateEmergencydocDto: UpdateEmergencydocDto,
) {
  const emergencydoc = await prisma.emergencyDoc.findUnique({ where: { id } });
  if (!emergencydoc) throw new NotFoundException('emergencydoc not found');

  const updatedEmergencydoc = await prisma.emergencyDoc.update({
    where: { id },
    data: {
      emergencyStatusId: updateEmergencydocDto.emergencyStatusId,
    },
  });

  return {
    message: 'Emergencydoc updated successfully',
    data: {
      id: updatedEmergencydoc.id,
      emergencyStatusId: updatedEmergencydoc.emergencyStatusId,
    },
  };
}
