import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRepairdistrictDto } from '../dto/create-repairdistrict.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createRepairDistrict(
  prisma: PrismaService,
  user: AuthUser,
  createRepairdistrictDto: CreateRepairdistrictDto,
) {
  return prisma.repairDistrict.create({
    data: {
      ...createRepairdistrictDto,
      branchId: Number(createRepairdistrictDto.branchId),
      createdById: user.id,
    },
  });
}
