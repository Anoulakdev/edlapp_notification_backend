import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProblemtypeDto } from '../dto/create-problemtype.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { MemoryCache } from '../../../utils/cache.util';

export async function createProblemType(
  prisma: PrismaService,
  user: AuthUser,
  createProblemtypeDto: CreateProblemtypeDto,
) {
  const result = await prisma.problemType.create({
    data: { ...createProblemtypeDto, createdById: user.id },
  });
  MemoryCache.deleteByPrefix('select:problem_types');
  return result;
}
