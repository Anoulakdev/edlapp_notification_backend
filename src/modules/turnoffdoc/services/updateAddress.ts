import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTurnoffdocDto } from '../dto/update-turnoffdoc.dto';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';
import moment from 'moment';

export async function updateAddress(
  prisma: PrismaService,
  id: number,
  updateTurnoffdocDto: UpdateTurnoffdocDto,
) {
  const { provinceId, districtId, villageId } = updateTurnoffdocDto;

  if (!id) {
    throw new Error('id is required');
  }

  if (!provinceId || !districtId || !villageId?.length) {
    throw new Error('provinceId, districtId, villageId is required');
  }

  // ✅ Fetch users residing in the updated villages from external API
  let assignData: any[] = [];
  let fcmTokens: string[] = [];
  const villageUserMap: Record<number, number> = {};

  if (villageId?.length) {
    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getByVillageIds`,
        {
          params: {
            village_id: villageId.join(','),
          },
          headers: {
            'x-api-key': process.env.API_KEY,
          },
          timeout: 30000,
        },
      );

      const apiUsers = response.data?.data || [];
      const uniqueUserIds = new Set<number>();
      const tokenSet = new Set<string>();
      const userSetByVillage: Record<number, Set<number>> = {};

      apiUsers.forEach((user: any) => {
        const uId = user.user_id ? Number(user.user_id) : null;
        const vId = Number(
          user.village_id ?? user.villageId ?? user.village?.id,
        );

        if (uId) {
          uniqueUserIds.add(uId);
        }

        if (vId && uId) {
          if (!userSetByVillage[vId]) {
            userSetByVillage[vId] = new Set<number>();
          }
          userSetByVillage[vId].add(uId);
        }

        // Ensure the token is a valid string, and not empty, 'null', 'undefined', or 'demo'
        const token = user.access_noti ? String(user.access_noti).trim() : '';
        if (
          token !== '' &&
          token.toLowerCase() !== 'demo' &&
          token.toLowerCase() !== 'null' &&
          token.toLowerCase() !== 'undefined'
        ) {
          tokenSet.add(token);
        }
      });

      // Calculate userCount per villageId
      villageId.forEach((vId) => {
        const idNum = Number(vId);
        villageUserMap[idNum] = userSetByVillage[idNum]
          ? userSetByVillage[idNum].size
          : 0;
      });

      assignData = Array.from(uniqueUserIds).map((userId) => ({
        turnoffId: Number(id),
        userAppId: userId,
        docview: false,
      }));

      fcmTokens = Array.from(tokenSet);
    } catch (error) {
      console.error('Failed to fetch users by village IDs:', error);
      throw new Error('Failed to fetch users for assignment from external API');
    }
  }

  // Run database update in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // ✅ check turnoffdoc
    const turnoffdoc = await tx.turnoffDoc.findUnique({
      where: { id: Number(id) },
    });

    if (!turnoffdoc) {
      throw new Error('turnoffdoc not found');
    }

    // ✅ delete ของเก่า
    await tx.turnoffAddress.deleteMany({
      where: { turnoffId: Number(id) },
    });

    await tx.turnoffAssign.deleteMany({
      where: { turnoffId: Number(id) },
    });

    let data: any[] = [];

    // ✅ กรณี village (บันทึก userCount ลงใน TurnoffAddress ของแต่ละหมู่บ้าน)
    if (villageId?.length) {
      data = villageId.map((villId: number) => ({
        turnoffId: Number(id),
        villageId: Number(villId),
        userCount: villageUserMap[Number(villId)] || 0,
      }));
    }

    // ✅ insert ใหม่
    await tx.turnoffAddress.createMany({
      data,
      skipDuplicates: true,
    });

    // ✅ insert assign ของผู้ใช้ในหมู่บ้านนั้นๆ
    if (assignData.length) {
      await tx.turnoffAssign.createMany({
        data: assignData,
        skipDuplicates: true,
      });
    }

    // ✅ อัปเดต provinceId และ districtId ใน turnoffDoc
    await tx.turnoffDoc.update({
      where: { id: Number(id) },
      data: {
        provinceId: Number(provinceId),
        districtId: Number(districtId),
      },
    });

    return {
      message: 'Update address success',
      count: data.length,
      title: turnoffdoc.title,
      startDate: turnoffdoc.startDate || '',
      endDate: turnoffdoc.endDate || '',
      startTime: turnoffdoc.startTime || '',
      endTime: turnoffdoc.endTime || '',
    };
  });

  // ✅ Send FCM notifications in the background (WITHOUT await to optimize API response time/performance)
  if (fcmTokens.length) {
    const startD = moment(result.startDate);
    const endD = moment(result.endDate);

    const dateText = startD.isSame(endD, 'day')
      ? startD.format('DD/MM/YYYY')
      : `${startD.format('DD/MM/YYYY')} - ${endD.format('DD/MM/YYYY')}`;

    sendFCM(
      fcmTokens,
      result.title,
      `ວັນທີ: ${dateText} ເວລາ: ${result.startTime} - ${result.endTime} ໂມງ`,
      {
        turnoffId: String(id),
      },
    ).catch((fcmError) => {
      console.error(
        'Failed to send FCM notifications in background:',
        fcmError,
      );
    });
  }

  return {
    message: result.message,
    count: result.count,
  };
}
