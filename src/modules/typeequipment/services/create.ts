import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTypeequipmentDto } from '../dto/create-typeequipment.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createTypeEquipment(
  prisma: PrismaService,
  user: AuthUser,
  createTypeequipmentDto: CreateTypeequipmentDto,
) {
  return prisma.typeEquipment.create({
    data: { ...createTypeequipmentDto, createdById: user.id },
  });
}
