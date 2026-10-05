import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTypeunitDto } from '../dto/create-typeunit.dto';

export async function createTypeUnit(
  prisma: PrismaService,
  createTypeunitDto: CreateTypeunitDto,
) {
  return prisma.typeUnit.create({
    data: { ...createTypeunitDto },
  });
}
