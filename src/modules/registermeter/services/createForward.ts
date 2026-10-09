import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateForwardDto } from '../dto/create-forward.dto';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';

export async function createForward(
  prisma: PrismaService,
  user: AuthUser,
  createForwardDto: CreateForwardDto,
) {
  const registerMeter = await prisma.registerMeter.findUnique({
    where: { id: Number(createForwardDto.meterId) },
    select: {
      id: true,
      createdById: true,
    },
  });

  if (!registerMeter) {
    throw new NotFoundException('RegisterMeter not found');
  }

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
      where: { id: Number(createForwardDto.meterId) },
      data: {
        meterStatusId: Number(createForwardDto.meterStatusId),
      },
    });

    return await tx.userAcceptMeter.create({
      data: {
        meterId: Number(createForwardDto.meterId),
        userCallId: user.id,
      },
    });
  });

  if (fcmTokens.length) {
    sendFCM(
      fcmTokens,
      'ແຈ້ງເຕືອນການລົງທະບຽນໝໍ້ນັບໄຟໃໝ່',
      `ຄຳຮ້ອງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟຂອງທ່ານ ແມ່ນຮັບເລື່ອງ ແລະ ສົ່ງຕໍ່ໃຫ້ສາຂາ/ເມືອງແລ້ວ`,
      {
        meterId: String(createForwardDto.meterId),
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
