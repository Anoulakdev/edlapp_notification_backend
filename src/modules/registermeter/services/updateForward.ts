import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateForwardDto } from '../dto/update-forward.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function updateForward(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateForwardDto: UpdateForwardDto,
) {
  const userAcceptMeter = await prisma.userAcceptMeter.findUnique({
    where: { meterId: Number(id) },
  });
  if (!userAcceptMeter)
    throw new NotFoundException('userAcceptMeter not found');

  return await prisma.$transaction(async (tx) => {
    await tx.registerMeter.update({
      where: { id: Number(id) },
      data: {
        meterStatusId: Number(updateForwardDto.meterStatusId),
      },
    });

    return await tx.userAcceptMeter.update({
      where: { id: Number(userAcceptMeter.id) },
      data: {
        userProvinceId: user.id,
      },
    });
  });
}
