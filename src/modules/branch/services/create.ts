import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createBranch(
  prisma: PrismaService,
  user: AuthUser,
  createBranchDto: CreateBranchDto,
) {
  return prisma.branch.create({
    data: { ...createBranchDto, createdById: user.id },
  });
}
