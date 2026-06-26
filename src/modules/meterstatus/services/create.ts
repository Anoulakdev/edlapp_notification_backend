import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeterstatusDto } from '../dto/create-meterstatus.dto';

export async function createMeterstatus(
  prisma: PrismaService,
  createMeterstatusDto: CreateMeterstatusDto,
) {
  return prisma.meterStatus.create({
    data: createMeterstatusDto,
  });
}
