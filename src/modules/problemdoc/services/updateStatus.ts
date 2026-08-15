import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateReceiverDto } from '../dto/update-receiver.dto';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  updateReceiverDto: UpdateReceiverDto,
) {
  if (
    updateReceiverDto.problemstatusId === undefined ||
    updateReceiverDto.problemstatusId === null ||
    isNaN(Number(updateReceiverDto.problemstatusId))
  ) {
    throw new BadRequestException(
      'problemstatusId is required and must be a valid number',
    );
  }

  const problemdoc = await prisma.problemDoc.findUnique({
    where: { id: Number(id) },
  });

  if (!problemdoc) {
    throw new NotFoundException('problemDoc not found');
  }

  return prisma.problemDoc.update({
    where: { id: Number(id) },
    data: {
      problemstatusId: Number(updateReceiverDto.problemstatusId),
    },
  });
}

