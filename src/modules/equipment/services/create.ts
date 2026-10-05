import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createEquipment(
  prisma: PrismaService,
  user: AuthUser,
  createEquipmentDto: CreateEquipmentDto,
) {
  return prisma.equipment.create({
    data: {
      ...createEquipmentDto,
      typeEquipmentId: Number(createEquipmentDto.typeEquipmentId),
      createdById: user.id,
    },
  });
}
