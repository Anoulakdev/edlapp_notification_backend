import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTyperepairDto } from '../dto/create-typerepair.dto';

export async function createTypeRepair(
  prisma: PrismaService,
  createTyperepairDto: CreateTyperepairDto,
) {
  return prisma.typeRepair.create({
    data: { ...createTyperepairDto },
  });
}
