import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';
import axios from 'axios';

const problemAssignInclude = {
  userSend: {
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
          tel: true,
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
          tel: true,
        },
      },
    },
  },
  voltage: {
    select: {
      id: true,
      name: true,
    },
  },
  typeRepair: {
    select: {
      id: true,
      name: true,
    },
  },
  problemEquipments: {
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
    },
  },
};

export async function findOneProblemDoc(prisma: PrismaService, id: number) {
  const problemdoc = await prisma.problemDoc.findUnique({
    where: { id },
    include: {
      problemtype: {
        select: {
          id: true,
          name: true,
          code: true,
          actived: true,
        },
      },
      province: true,
      district: true,
      village: true,
      sourcetype: true,
      problemstatus: true,
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      repairDistrict: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      parentProblem: {
        select: {
          id: true,
          fullName: true,
          tel: true,
          description: true,
          createdAt: true,
          problemAssigns: {
            include: problemAssignInclude,
          },
        },
      },
      duplicateProblems: {
        select: {
          id: true,
          fullName: true,
          tel: true,
          description: true,
          createdAt: true,
        },
      },
      problemAssigns: {
        include: problemAssignInclude,
      },
    },
  });

  if (!problemdoc) throw new NotFoundException('problemDoc not found');

  const problemAssigns =
    problemdoc.parentProblemId && problemdoc.parentProblem?.problemAssigns
      ? problemdoc.parentProblem.problemAssigns
      : problemdoc.problemAssigns;

  let createdName = '';
  let createdTel = '';

  if (problemdoc.sourcetypeId === 1) {
    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getUserById/${problemdoc.createdById}`,
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
          timeout: 5000,
        },
      );
      createdName = response.data?.data?.username || '';
      createdTel = response.data?.data?.phone_no || '';
    } catch (error) {
      console.error(
        `Failed to fetch external user by ID ${problemdoc.createdById}:`,
        error.message,
      );
    }
  } else if (problemdoc.sourcetypeId === 3) {
    try {
      const localUser = await prisma.user.findUnique({
        where: { id: problemdoc.createdById },
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
        `Failed to query local user by ID ${problemdoc.createdById}:`,
        error.message,
      );
    }
  }

  return {
    ...problemdoc,
    problemAssigns,
    createdName,
    createdTel,
    createdAt: moment(problemdoc.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(problemdoc.updatedAt).tz('Asia/Vientiane').format(),
  };
}
