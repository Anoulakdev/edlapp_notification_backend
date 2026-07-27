import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { UpdateEmergencydocDto } from '../dto/update-emergencydoc.dto';
import { NotFoundException } from '@nestjs/common';
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

export async function edlWorkerUpdate(
  prisma: PrismaService,
  id: number,
  user: AuthUser,
  updateEmergencydocDto: UpdateEmergencydocDto,
) {
  const emergencydoc = await prisma.emergencyDoc.findUnique({
    where: { id: Number(id) },
  });

  if (!emergencydoc) {
    throw new NotFoundException('emergencydoc not found');
  }

  const newImgUploaded =
    updateEmergencydocDto.emergencyImg &&
    updateEmergencydocDto.emergencyImg !== emergencydoc.emergencyImg;

  const newAudioUploaded =
    updateEmergencydocDto.emergencyAudio &&
    updateEmergencydocDto.emergencyAudio !== emergencydoc.emergencyAudio;

  try {
    // Delete old image if new image was uploaded
    if (newImgUploaded && emergencydoc.emergencyImg) {
      await deleteUploadedFile(emergencydoc.emergencyImg);
    } else if (!updateEmergencydocDto.emergencyImg) {
      updateEmergencydocDto.emergencyImg =
        emergencydoc.emergencyImg || undefined;
    }

    // Delete old audio if new audio was uploaded
    if (newAudioUploaded && emergencydoc.emergencyAudio) {
      await deleteUploadedFile(emergencydoc.emergencyAudio);
    } else if (!updateEmergencydocDto.emergencyAudio) {
      updateEmergencydocDto.emergencyAudio =
        emergencydoc.emergencyAudio || undefined;
    }

    const { villageId, ...emergencyData } = updateEmergencydocDto;

    const startTime =
      updateEmergencydocDto.startTime !== undefined
        ? updateEmergencydocDto.startTime
        : emergencydoc.startTime;
    const endTime =
      updateEmergencydocDto.endTime !== undefined
        ? updateEmergencydocDto.endTime
        : emergencydoc.endTime;
    const useTime = calculateUseTime(
      startTime || undefined,
      endTime || undefined,
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
          },
        );

        const apiUsers = response.data?.data || [];
        const uniqueUserIds = new Set<number>();
        const tokenSet = new Set<string>();

        apiUsers.forEach((u: any) => {
          if (u.user_id) {
            uniqueUserIds.add(Number(u.user_id));
          }

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
    const updatedDoc = await prisma.$transaction(async (tx) => {
      const doc = await tx.emergencyDoc.update({
        where: { id: Number(id) },
        data: {
          ...emergencyData,
          emergencyDate: updateEmergencydocDto.emergencyDate
            ? new Date(updateEmergencydocDto.emergencyDate)
            : undefined,
          startTime: updateEmergencydocDto.startTime,
          endTime: updateEmergencydocDto.endTime,
          useTime,
          lat:
            updateEmergencydocDto.lat !== undefined
              ? Number(updateEmergencydocDto.lat)
              : undefined,
          lng:
            updateEmergencydocDto.lng !== undefined
              ? Number(updateEmergencydocDto.lng)
              : undefined,
          emergencyImg: updateEmergencydocDto.emergencyImg || null,
          emergencyAudio: updateEmergencydocDto.emergencyAudio || null,
          provinceId: user.provinceId ? Number(user.provinceId) : null,
          districtId: user.districtId ? Number(user.districtId) : null,
        },
      });

      if (villageId !== undefined) {
        // Delete existing address & assign records
        await tx.emergencyAddress.deleteMany({
          where: { emergencyId: Number(id) },
        });

        await tx.emergencyAssign.deleteMany({
          where: { emergencyId: Number(id) },
        });

        if (villageId.length) {
          const addressData = villageId.map((villId: number) => ({
            emergencyId: doc.id,
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
            emergencyId: doc.id,
          }));

          await tx.emergencyAssign.createMany({
            data: assignRecords,
            skipDuplicates: true,
          });
        }
      }

      return doc;
    });

    // Send FCM notifications in the background (WITHOUT await)
    if (fcmTokens.length) {
      const timeStr =
        updatedDoc.startTime && updatedDoc.endTime
          ? ` ເວລາ: ${updatedDoc.startTime} - ${updatedDoc.endTime} ໂມງ`
          : '';
      sendFCM(
        fcmTokens,
        updatedDoc.title || 'ແຈ້ງມອດໄຟສຸກເສີນ',
        `ວັນທີ: ${moment(updatedDoc.emergencyDate).format('DD/MM/YYYY')}${timeStr}`,
        {
          emergencyId: String(updatedDoc.id),
        },
      ).catch((fcmError) => {
        console.error(
          'Failed to send FCM notifications in background:',
          fcmError,
        );
      });
    }

    return updatedDoc;
  } catch (error) {
    if (newImgUploaded) {
      await deleteUploadedFile(updateEmergencydocDto.emergencyImg);
    }
    if (newAudioUploaded) {
      await deleteUploadedFile(updateEmergencydocDto.emergencyAudio);
    }
    throw error;
  }
}
