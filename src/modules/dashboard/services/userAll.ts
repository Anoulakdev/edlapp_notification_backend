import { PrismaService } from '../../../prisma/prisma.service';

export const ROLE_IDS = [2, 3, 4, 5, 6];

export async function userAll(prisma: PrismaService) {
  // ນັບຈຳນວນ user ທັງໝົດທີ່ມີ roleId = [2, 3, 4, 5, 6] (ບໍ່ວ່າຈະ status ໃດກໍຕາມ)
  const count = await prisma.user.count({
    where: {
      roleId: { in: ROLE_IDS },
    },
  });

  return {
    userall: count,
  };
}
