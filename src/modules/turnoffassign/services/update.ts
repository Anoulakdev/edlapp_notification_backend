import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTurnoffassignDto } from '../dto/update-turnoffassign.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateTurnoffAssign(
  prisma: PrismaService,
  id: number,
  updateTurnoffassignDto: UpdateTurnoffassignDto,
) {
  const turnoffAssign = await prisma.turnoffAssign.findUnique({
    where: { id },
  });
  if (!turnoffAssign) throw new NotFoundException('turnoffAssign not found');

  return await prisma.turnoffAssign.update({
    where: { id },
    data: {
      docview: updateTurnoffassignDto.docview,
    },
  });
}
