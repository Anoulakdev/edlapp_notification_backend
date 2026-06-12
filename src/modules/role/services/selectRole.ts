import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function selectRole(prisma: PrismaService, user: AuthUser) {
  if (user.roleId === 1) {
    return prisma.role.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  } else if (user.roleId === 2) {
    return prisma.role.findMany({
      where: {
        id: { in: [2, 3] },
      },
      orderBy: {
        id: 'asc',
      },
    });
  } else if (user.roleId === 4) {
    return prisma.role.findMany({
      where: {
        id: { in: [4, 5] },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }
}
