import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeUser(prisma: PrismaService, id: number) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  await prisma.$transaction(async (tx) => {
    // Delete fcm tokens first to prevent foreign key violations
    await tx.fcmToken.deleteMany({ where: { userId: id } });

    // Delete user
    await tx.user.delete({ where: { id } });

    // Delete employee
    await tx.employee.delete({ where: { id: user.employeeId } });
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'User deleted successfully',
    userId: id,
  };
}
