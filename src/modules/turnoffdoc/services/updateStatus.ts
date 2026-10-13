import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTurnoffdocDto } from '../dto/update-turnoffdoc.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  updateTurnoffdocDto: UpdateTurnoffdocDto,
) {
  const turnoffdoc = await prisma.turnoffDoc.findUnique({ where: { id } });
  if (!turnoffdoc) throw new NotFoundException('turnoffdoc not found');

  const updatedTurnoffdoc = await prisma.turnoffDoc.update({
    where: { id },
    data: {
      turnoffStatusId: updateTurnoffdocDto.turnoffStatusId,
    },
  });

  return {
    message: 'Turnoffdoc updated successfully',
    data: {
      id: updatedTurnoffdoc.id,
      turnoffStatusId: updatedTurnoffdoc.turnoffStatusId,
    },
  };
}
