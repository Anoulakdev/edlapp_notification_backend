import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneProblemDoc(prisma: PrismaService, id: number) {
  const problemdoc = await prisma.problemDoc.findUnique({
    where: { id },
    include: {
      problemtype: true,
      province: true,
      district: true,
      village: true,
      sourcetype: true,
      problemstatus: true,
      problemAssigns: {
        include: {
          userReceiver: {
            select: {
              id: true,
              employee: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  emp_code: true,
                },
              },
            },
          },
          userActive: {
            select: {
              id: true,
              employee: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  emp_code: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!problemdoc) throw new NotFoundException('problemDoc not found');

  return {
    ...problemdoc,
    createdAt: moment(problemdoc.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(problemdoc.updatedAt).tz('Asia/Vientiane').format(),
    problemAssigns: problemdoc.problemAssigns
      ? {
          ...problemdoc.problemAssigns,
          createdAt: moment(problemdoc.problemAssigns.createdAt)
            .tz('Asia/Vientiane')
            .format(),
          updatedAt: moment(problemdoc.problemAssigns.updatedAt)
            .tz('Asia/Vientiane')
            .format(),
        }
      : null,
  };
}
