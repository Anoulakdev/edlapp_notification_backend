import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateEmergencydocDto } from '../dto/create-emergencydoc.dto';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';
import moment from 'moment';

async function deleteUploadedFile(filename?: string) {
  if (!filename) return;

  const filePath = path.resolve(
    process.env.UPLOAD_BASE_PATH || '',
    'emergency',
    filename,
  );

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error(`Error deleting uploaded file at ${filePath}:`, err);
  }
}

function calculateUseTime(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return 0;
  }

  let diff = endH * 60 + endM - (startH * 60 + startM);
  if (diff < 0) {
    diff += 24 * 60;
  }
  return diff;
}

export async function edlWorkerCreate(
  prisma: PrismaService,
  user: AuthUser,
  createEmergencydocDto: CreateEmergencydocDto,
) {
  try {
    const { villageId, ...emergencyData } = createEmergencydocDto;

    const useTime = calculateUseTime(
      createEmergencydocDto.startTime,
      createEmergencydocDto.endTime,
    );

    // Fetch users residing in the specified villages from external API
    let assignData: any[] = [];
    let fcmTokens: string[] = [];
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

        apiUsers.forEach((u: any) => {
          if (u.user_id) {
            uniqueUserIds.add(Number(u.user_id));
          }

          // Ensure the token is a valid string, and not empty, 'null', 'undefined', or 'demo'
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

        assignData = Array.from(uniqueUserIds).map((userId) => ({
          userAppId: userId,
          docview: false,
        }));

        fcmTokens = Array.from(tokenSet);
      } catch (error) {
        console.error('Failed to fetch users by village IDs:', error);
        throw new Error(
          'Failed to fetch users for assignment from external API',
        );
      }
    }

    // Run database operations in a transaction
    const emergencyDoc = await prisma.$transaction(async (tx) => {
      const createdDoc = await tx.emergencyDoc.create({
        data: {
          ...emergencyData,
          emergencyDate: new Date(createEmergencydocDto.emergencyDate),
          startTime: createEmergencydocDto.startTime,
          endTime: createEmergencydocDto.endTime,
          useTime,
          lat: Number(createEmergencydocDto.lat),
          lng: Number(createEmergencydocDto.lng),
          emergencyImg: createEmergencydocDto.emergencyImg || '',
          emergencyAudio: createEmergencydocDto.emergencyAudio || '',
          provinceId: user.provinceId ? Number(user.provinceId) : null,
          districtId: user.districtId ? Number(user.districtId) : null,
          createdById: user.id,
        },
      });

      if (villageId?.length) {
        const addressData = villageId.map((villId: number) => ({
          emergencyId: createdDoc.id,
          villageId: Number(villId),
        }));

        await tx.emergencyAddress.createMany({
          data: addressData,
          skipDuplicates: true,
        });
      }

      if (assignData.length) {
        const assignRecords = assignData.map((item) => ({
          ...item,
          emergencyId: createdDoc.id,
        }));

        await tx.emergencyAssign.createMany({
          data: assignRecords,
          skipDuplicates: true,
        });
      }

      return createdDoc;
    });

    // Send FCM notifications in the background (WITHOUT await to optimize API response time)
    if (fcmTokens.length) {
      const timeStr =
        emergencyDoc.startTime && emergencyDoc.endTime
          ? ` ເວລາ: ${emergencyDoc.startTime} - ${emergencyDoc.endTime} ໂມງ`
          : '';
      sendFCM(
        fcmTokens,
        emergencyDoc.title || 'ແຈ້ງມອດໄຟສຸກເສີນ',
        `ວັນທີ: ${moment(emergencyDoc.emergencyDate).format('DD/MM/YYYY')}${timeStr}`,
        {
          emergencyId: String(emergencyDoc.id),
        },
      ).catch((fcmError) => {
        console.error(
          'Failed to send FCM notifications in background:',
          fcmError,
        );
      });
    }

    return emergencyDoc;
  } catch (error) {
    await deleteUploadedFile(createEmergencydocDto?.emergencyImg);
    await deleteUploadedFile(createEmergencydocDto?.emergencyAudio);
    throw error;
  }
}
