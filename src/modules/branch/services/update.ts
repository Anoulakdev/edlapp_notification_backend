import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { MemoryCache } from '../../../utils/cache.util';

export async function updateBranch(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateBranchDto: UpdateBranchDto,
) {
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) throw new NotFoundException('branch not found');

  const result = await prisma.branch.update({
    where: { id },
    data: { ...updateBranchDto, createdById: user.id },
  });
  MemoryCache.delete('select:branches');
  return result;
}
