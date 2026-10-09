import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateRegistermeterDto } from '../dto/update-registermeter.dto';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';

export async function updateReject(
  prisma: PrismaService,
  id: number,
  updateRegistermeterDto: UpdateRegistermeterDto,
) {
  const registermeter = await prisma.registerMeter.findUnique({
    where: { id: Number(id) },
  });
  if (!registermeter) throw new NotFoundException('registerMeter not found');

  const createdById = registermeter.createdById;

  let fcmTokens: string[] = [];
  if (createdById) {
    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getUserById/${createdById}`,
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
          timeout: 5000,
        },
      );

      const apiUserData = response.data?.data;
      const tokenSet = new Set<string>();

      if (apiUserData) {
        if (Array.isArray(apiUserData)) {
          apiUserData.forEach((u: any) => {
            const token = u.access_noti ? String(u.access_noti).trim() : '';
            if (
              token !== '' &&
              token.toLowerCase() !== 'demo' &&
              token.toLowerCase() !== 'null' &&
              token.toLowerCase() !== 'undefined'
            ) {
              tokenSet.add(token);
            }
          });
        } else {
          const token = apiUserData.access_noti
            ? String(apiUserData.access_noti).trim()
            : '';
          if (
            token !== '' &&
            token.toLowerCase() !== 'demo' &&
            token.toLowerCase() !== 'null' &&
            token.toLowerCase() !== 'undefined'
          ) {
            tokenSet.add(token);
          }
        }
      }

      fcmTokens = Array.from(tokenSet);
    } catch (error) {
      console.error('Failed to fetch user FCM token from external API:', error);
      // Fallback gracefully: do not throw to avoid blocking the message delivery!
    }
  }

  const result = await prisma.registerMeter.update({
    where: { id: Number(id) },
    data: {
      meterStatusId: 4,
      comment: updateRegistermeterDto.comment,
    },
  });

  if (fcmTokens.length) {
    const reason = updateRegistermeterDto.comment
      ? `: ${updateRegistermeterDto.comment}`
      : '';

    sendFCM(
      fcmTokens,
      'ແຈ້ງເຕືອນການລົງທະບຽນໝໍ້ນັບໄຟໃໝ່',
      `ຄຳຮ້ອງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟຂອງທ່ານ ບໍ່ຜ່ານການກວດສອບ (ເອກະສານບໍ່ຄົບ)${reason}`,
      {
        meterId: String(id),
        type: 'registermeter',
      },
    ).catch((fcmError) => {
      console.error(
        'Failed to send FCM notifications in background:',
        fcmError,
      );
    });
  }

  return result;
}
