import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateForwardDto } from '../dto/update-forward.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';

export async function updateForward(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateForwardDto: UpdateForwardDto,
) {
  const [registerMeter, userAcceptMeter] = await Promise.all([
    prisma.registerMeter.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        createdById: true,
      },
    }),
    prisma.userAcceptMeter.findUnique({
      where: { meterId: Number(id) },
    }),
  ]);

  if (!registerMeter) throw new NotFoundException('registerMeter not found');
  if (!userAcceptMeter)
    throw new NotFoundException('userAcceptMeter not found');

  const createdById = registerMeter.createdById;

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

  const result = await prisma.$transaction(async (tx) => {
    await tx.registerMeter.update({
      where: { id: Number(id) },
      data: {
        meterStatusId: Number(updateForwardDto.meterStatusId),
      },
    });

    return await tx.userAcceptMeter.update({
      where: { id: Number(userAcceptMeter.id) },
      data: {
        userProvinceId: user.id,
      },
    });
  });

  if (fcmTokens.length) {
    sendFCM(
      fcmTokens,
      'ແຈ້ງເຕືອນການລົງທະບຽນໝໍ້ນັບໄຟໃໝ່',
      'ຄຳຮ້ອງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟຂອງທ່ານ ແມ່ນສາຂາ/ເມືອງໄດ້ຮັບເລື່ອງແລ້ວ ແລະ ຈະຕິດຕໍ່ຫາທ່ານໂດຍໄວ!',
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
