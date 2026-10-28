import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { BadRequestException } from '@nestjs/common';

export async function createEquipment(
  prisma: PrismaService,
  user: AuthUser,
  createEquipmentDto: CreateEquipmentDto,
) {
  if (!user?.branchId) {
    throw new BadRequestException('User does not belong to a valid branch');
  }

  return prisma.equipment.create({
    data: {
      ...createEquipmentDto,
      branchId: Number(user.branchId),
      createdById: user.id,
    },
  });
}
