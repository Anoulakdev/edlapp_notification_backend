import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateCutpowerassignDto } from '../dto/update-cutpowerassign.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateCutpowerAssign(
  prisma: PrismaService,
  id: number,
  updateCutpowerassignDto: UpdateCutpowerassignDto,
) {
  const cutpowerAssign = await prisma.cutpowerAssign.findUnique({
    where: { id },
  });
  if (!cutpowerAssign) throw new NotFoundException('cutpowerAssign not found');

  return await prisma.cutpowerAssign.update({
    where: { id },
    data: {
      docview: updateCutpowerassignDto.docview,
    },
  });
}
