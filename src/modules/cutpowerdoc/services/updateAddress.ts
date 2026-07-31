import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateCutpowerdocDto } from '../dto/update-cutpowerdoc.dto';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';
import moment from 'moment';

export async function updateAddress(
  prisma: PrismaService,
  id: number,
  updateCutpowerdocDto: UpdateCutpowerdocDto,
) {
  const { provinceId, districtId, villageId } = updateCutpowerdocDto;

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
        cutpowerId: Number(id),
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
    // ✅ check cutpowerdoc
    const cutpowerdoc = await tx.cutpowerDoc.findUnique({
      where: { id: Number(id) },
    });

    if (!cutpowerdoc) {
      throw new Error('cutpowerdoc not found');
    }

    // ✅ delete ของเก่า
    await tx.cutpowerAddress.deleteMany({
      where: { cutpowerId: Number(id) },
    });

    await tx.cutpowerAssign.deleteMany({
      where: { cutpowerId: Number(id) },
    });

    let data: any[] = [];

    // ✅ กรณี village (บันทึก userCount ลงใน CutpowerAddress ของแต่ละหมู่บ้าน)
    if (villageId?.length) {
      data = villageId.map((villId: number) => ({
        cutpowerId: Number(id),
        villageId: Number(villId),
        userCount: villageUserMap[Number(villId)] || 0,
      }));
    }

    // ✅ insert ใหม่
    await tx.cutpowerAddress.createMany({
      data,
      skipDuplicates: true,
    });

    // ✅ insert assign ของผู้ใช้ในหมู่บ้านนั้นๆ
    if (assignData.length) {
      await tx.cutpowerAssign.createMany({
        data: assignData,
        skipDuplicates: true,
      });
    }

    // ✅ อัปเดต provinceId และ districtId ใน cutpowerDoc
    await tx.cutpowerDoc.update({
      where: { id: Number(id) },
      data: {
        provinceId: Number(provinceId),
        districtId: Number(districtId),
      },
    });

    return {
      message: 'Update address success',
      count: data.length,
      title: cutpowerdoc.title,
      cutpowerDate: cutpowerdoc.cutpowerDate,
    };
  });

  // ✅ Send FCM notifications in the background (WITHOUT await to optimize API response time/performance)
  if (fcmTokens.length) {
    sendFCM(
      fcmTokens,
      result.title,
      `ວັນທີ: ${moment(result.cutpowerDate).format('DD/MM/YYYY')}`,
      {
        cutpowerId: String(id),
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
