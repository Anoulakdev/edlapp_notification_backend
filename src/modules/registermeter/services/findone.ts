import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';
import axios from 'axios';

export async function findOneRegisterMeter(prisma: PrismaService, id: number) {
  const registermeter = await prisma.registerMeter.findUnique({
    where: { id },
    include: {
      province: true,
      district: true,
      village: true,
      sourcetype: true,
      meterStatus: true,
      userAcceptMeters: {
        include: {
          userCall: {
            select: {
              id: true,
              employee: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  emp_code: true,
                  tel: true,
                },
              },
            },
          },
          userProvince: {
            select: {
              id: true,
              employee: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  emp_code: true,
                  tel: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!registermeter) throw new NotFoundException('registerMeter not found');

  let createdName = '';
  let createdTel = '';

  if (registermeter.sourcetypeId === 1) {
    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getUserById/${registermeter.createdById}`,
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        },
      );
      createdName = response.data?.data?.username || '';
      createdTel = response.data?.data?.phone_no || '';
    } catch (error) {
      console.error(
        `Failed to fetch external user by ID ${registermeter.createdById}:`,
        error.message,
      );
    }
  } else if (registermeter.sourcetypeId === 2) {
    try {
      const localUser = await prisma.user.findUnique({
        where: { id: registermeter.createdById },
        include: {
          employee: {
            select: {
              first_name: true,
              last_name: true,
              tel: true,
            },
          },
        },
      });
      if (localUser?.employee) {
        createdName =
          `${localUser.employee.first_name} ${localUser.employee.last_name}`.trim();
        createdTel = localUser.employee.tel || '';
      }
    } catch (error) {
      console.error(
        `Failed to query local user by ID ${registermeter.createdById}:`,
        error.message,
      );
    }
  }

  return {
    ...registermeter,
    createdName,
    createdTel,
    createdAt: moment(registermeter.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(registermeter.updatedAt).tz('Asia/Vientiane').format(),
    userAcceptMeters: registermeter.userAcceptMeters
      ? {
          ...registermeter.userAcceptMeters,
          createdAt: moment(registermeter.userAcceptMeters.createdAt)
            .tz('Asia/Vientiane')
            .format(),
          updatedAt: moment(registermeter.userAcceptMeters.updatedAt)
            .tz('Asia/Vientiane')
            .format(),
        }
      : null,
  };
}
