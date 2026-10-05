import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';
import { UserGateway } from '../../user/user.gateway';

export const ALLOWED_ONLINE_ROLE_IDS = [2, 3, 4, 5, 6];

export async function userOnline(
  prisma: PrismaService,
  userGateway?: UserGateway,
) {
  // ດຶງລາຍການ user IDs ທີ່ມີ WebSocket ເຊື່ອມຕໍ່ຢູ່ຈິງໃນຂະນະນີ້ (Real-time Socket)
  const liveSocketUserIds = userGateway ? userGateway.getOnlineUserIds() : [];

  // ເງື່ອນໄຂ Real-time Online:
  // 1. isOnline = true ໃນຖານຂໍ້ມູນ
  // ຫຼື 2. ມີ WebSocket ເຊື່ອມຕໍ່ຢູ່ຈິງໃນ UserGateway
  const onlineCondition: Prisma.UserWhereInput[] = [{ isOnline: true }];
  if (liveSocketUserIds.length > 0) {
    onlineCondition.push({ id: { in: liveSocketUserIds } });
  }

  const where: Prisma.UserWhereInput = {
    roleId: { in: ALLOWED_ONLINE_ROLE_IDS },
    status: 'A', // ສະເພາະຜູ້ໃຊ້ທີ່ Active
    OR: onlineCondition,
  };

  // ນັບຈຳນວນຜູ້ໃຊ້ງານທີ່ online ແບບ Real-time
  const count = await prisma.user.count({ where });

  return {
    useronline: count,
  };
}
