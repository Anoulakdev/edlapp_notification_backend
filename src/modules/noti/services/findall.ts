import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindAllNoti(prisma: PrismaService, userAppId: number) {
  const where = {
    userAppId: Number(userAppId),
    docview: false,
  };

  const [turnoffAssigns, emergencyAssigns, cutpowerAssigns] = await Promise.all([
    prisma.turnoffAssign.findMany({
      where,
      orderBy: {
        turnoff: {
          id: 'desc',
        },
      },
      include: {
        turnoff: true,
      },
    }),
    prisma.emergencyAssign.findMany({
      where,
      orderBy: {
        emergency: {
          id: 'desc',
        },
      },
      include: {
        emergency: true,
      },
    }),
    prisma.cutpowerAssign.findMany({
      where,
      orderBy: {
        cutpower: {
          id: 'desc',
        },
      },
      include: {
        cutpower: true,
      },
    }),
  ]);

  const mappedTurnoff = turnoffAssigns.map((turnoffAssign) => ({
    ...turnoffAssign,
    createdAt: moment(turnoffAssign.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(turnoffAssign.updatedAt).tz('Asia/Vientiane').format(),
    turnoff: {
      ...turnoffAssign.turnoff,
      startDate: moment(turnoffAssign.turnoff.startDate).format('YYYY-MM-DD'),
      endDate: moment(turnoffAssign.turnoff.endDate).format('YYYY-MM-DD'),
    },
  }));

  const mappedEmergency = emergencyAssigns.map((emergencyAssign) => ({
    ...emergencyAssign,
    createdAt: moment(emergencyAssign.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(emergencyAssign.updatedAt).tz('Asia/Vientiane').format(),
    emergency: {
      ...emergencyAssign.emergency,
      emergencyDate: moment(emergencyAssign.emergency.emergencyDate)
        .tz('Asia/Vientiane')
        .format('YYYY-MM-DD'),
    },
  }));

  const mappedCutpower = cutpowerAssigns.map((cutpowerAssign) => ({
    ...cutpowerAssign,
    createdAt: moment(cutpowerAssign.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(cutpowerAssign.updatedAt).tz('Asia/Vientiane').format(),
    cutpower: {
      ...cutpowerAssign.cutpower,
      cutpowerDate: moment(cutpowerAssign.cutpower.cutpowerDate)
        .tz('Asia/Vientiane')
        .format('YYYY-MM-DD'),
    },
  }));

  return {
    turnoffAssigns: mappedTurnoff,
    emergencyAssigns: mappedEmergency,
    cutpowerAssigns: mappedCutpower,
  };
}
