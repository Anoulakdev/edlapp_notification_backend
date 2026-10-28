import { PrismaService } from '../../../prisma/prisma.service';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export async function removeTypeRepair(prisma: PrismaService, id: number) {
  const typeRepair = await prisma.typeRepair.findUnique({
    where: { id },
  });
  if (!typeRepair) throw new NotFoundException('type repair not found');

  const usedCount = await prisma.problemAssign.count({
    where: { typeRepairId: id },
  });
  if (usedCount > 0) {
    throw new BadRequestException(
      'Cannot delete type repair because it is already used in repair records',
    );
  }

  await prisma.typeRepair.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'type repair deleted successfully',
  };
}
