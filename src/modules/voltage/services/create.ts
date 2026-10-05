import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVoltageDto } from '../dto/create-voltage.dto';

export async function createVoltage(
  prisma: PrismaService,
  createVoltageDto: CreateVoltageDto,
) {
  return prisma.voltage.create({
    data: { ...createVoltageDto },
  });
}
