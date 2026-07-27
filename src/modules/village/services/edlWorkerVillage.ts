import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function edlWorkerVillage(
  prisma: PrismaService,
  user?: AuthUser,
) {
  if (!user?.districtId) {
    return [];
  }

  const district = await prisma.district.findUnique({
    where: { id: Number(user.districtId) },
    select: { district_code: true },
  });

  if (!district?.district_code) {
    return [];
  }

  return prisma.village.findMany({
    where: { districtCode: district.district_code },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      village_name: true,
      districtCode: true,
    },
  });
}
