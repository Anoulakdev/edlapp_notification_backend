import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindAllEmergencyAssign(
  prisma: PrismaService,
  userAppId: number,
) {
  const emergencyAssigns = await prisma.emergencyAssign.findMany({
    where: { userAppId: Number(userAppId) },
    orderBy: {
      emergency: {
        id: 'desc',
      },
    },
    include: {
      emergency: true,
    },
  });

  return emergencyAssigns.map((emergencyAssign) => {
    return {
      ...emergencyAssign,
      createdAt: moment(emergencyAssign.createdAt)
        .tz('Asia/Vientiane')
        .format(),
      updatedAt: moment(emergencyAssign.updatedAt)
        .tz('Asia/Vientiane')
        .format(),
      emergency: {
        ...emergencyAssign.emergency,
        emergencyDate: moment(emergencyAssign.emergency.emergencyDate).format(
          'YYYY-MM-DD',
        ),
      },
    };
  });
}
