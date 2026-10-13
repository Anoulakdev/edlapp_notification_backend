import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { MemoryCache } from '../../../utils/cache.util';

export async function createBranch(
  prisma: PrismaService,
  user: AuthUser,
  createBranchDto: CreateBranchDto,
) {
  const result = await prisma.branch.create({
    data: { ...createBranchDto, createdById: user.id },
  });
  MemoryCache.delete('select:branches');
  return result;
}
