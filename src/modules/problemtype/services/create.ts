import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProblemtypeDto } from '../dto/create-problemtype.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function createProblemType(
  prisma: PrismaService,
  user: AuthUser,
  createProblemtypeDto: CreateProblemtypeDto,
) {
  return prisma.problemType.create({
    data: { ...createProblemtypeDto, createdById: user.id },
  });
}
