import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSourcetypeDto } from '../dto/create-sourcetype.dto';

export async function createSourceType(
  prisma: PrismaService,
  createSourcetypeDto: CreateSourcetypeDto,
) {
  return prisma.sourceType.create({
    data: createSourcetypeDto,
  });
}
