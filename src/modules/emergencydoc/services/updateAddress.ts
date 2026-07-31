import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateEmergencydocDto } from '../dto/update-emergencydoc.dto';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';
import moment from 'moment';

export async function updateAddress(
  prisma: PrismaService,
  id: number,
  updateEmergencydocDto: UpdateEmergencydocDto,
) {
  const { provinceId, districtId, villageId } = updateEmergencydocDto;

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
        },
      );

      const apiUsers = response.data?.data || [];
      const uniqueUserIds = new Set<number>();
      const tokenSet = new Set<string>();
      const userSetByVillage: Record<number, Set<number>> = {};

      apiUsers.forEach((user: any) => {
        const uId = user.user_id ? Number(user.user_id) : null;
        const vId = Number(user.village_id ?? user.villageId ?? user.village?.id);

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
        villageUserMap[idNum] = userSetByVillage[idNum] ? userSetByVillage[idNum].size : 0;
      });

      assignData = Array.from(uniqueUserIds).map((userId) => ({
        emergencyId: Number(id),
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
    // ✅ check emergencydoc
    const emergencydoc = await tx.emergencyDoc.findUnique({
      where: { id: Number(id) },
    });

    if (!emergencydoc) {
      throw new Error('emergencydoc not found');
    }

    // ✅ delete ของเก่า
    await tx.emergencyAddress.deleteMany({
      where: { emergencyId: Number(id) },
    });

    await tx.emergencyAssign.deleteMany({
      where: { emergencyId: Number(id) },
    });

    let data: any[] = [];

    // ✅ กรณี village (บันทึก userCount ลงใน EmergencyAddress ของแต่ละหมู่บ้าน)
    if (villageId?.length) {
      data = villageId.map((villId: number) => ({
        emergencyId: Number(id),
        villageId: Number(villId),
        userCount: villageUserMap[Number(villId)] || 0,
      }));
    }

    // ✅ insert ใหม่
    await tx.emergencyAddress.createMany({
      data,
      skipDuplicates: true,
    });

    // ✅ insert assign ของผู้ใช้ในหมู่บ้านนั้นๆ
    if (assignData.length) {
      await tx.emergencyAssign.createMany({
        data: assignData,
        skipDuplicates: true,
      });
    }

    // ✅ อัปเดต provinceId และ districtId ใน emergencydoc
    await tx.emergencyDoc.update({
      where: { id: Number(id) },
      data: {
        provinceId: Number(provinceId),
        districtId: Number(districtId),
      },
    });

    return {
      message: 'Update address success',
      count: data.length,
      title: emergencydoc.title,
      emergencyDate: emergencydoc.emergencyDate || '',
      startTime: emergencydoc.startTime || '',
      endTime: emergencydoc.endTime || '',
    };
  });

  // ✅ Send FCM notifications in the background (WITHOUT await to optimize API response time/performance)
  if (fcmTokens.length) {
    const timeStr =
      result.startTime && result.endTime
        ? ` ເວລາ: ${result.startTime} - ${result.endTime} ໂມງ`
        : '';
    sendFCM(
      fcmTokens,
      result.title || 'ແຈ້ງມອດໄຟສຸກເສີນ',
      `ວັນທີ: ${moment(result.emergencyDate).format('DD/MM/YYYY')}${timeStr}`,
      {
        emergencyId: String(id),
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
