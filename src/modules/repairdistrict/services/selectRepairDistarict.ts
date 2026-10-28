import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function selectRepairDistrict(
  prisma: PrismaService,
  user: AuthUser,
  branchId?: number,
) {
  // ຖ້າມີ branchId ສົ່ງມາ ໃຫ້ໃຊ້ branchId, ຖ້າບໍ່ມີແຕ່ user ມີ branchId ໃຫ້ໃຊ້ຂອງ user, ຖ້າບໍ່ມີທັງສອງໃຫ້ເປັນ undefined (ດຶງທັງໝົດ)
  const targetBranchId = branchId
    ? Number(branchId)
    : user?.branchId
      ? Number(user.branchId)
      : undefined;

  const repairdistricts = await prisma.repairDistrict.findMany({
    where: {
      branchId: targetBranchId,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return repairdistricts;
}
