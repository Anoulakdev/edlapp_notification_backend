import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiPosition {
  pos_id: number;
  pos_name: string;
  pos_status: string;
  pos_code_id: number;
}

interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiPosition[];
}

interface Position {
  id: number;
  pos_name: string;
  pos_status: string;
  poscodeId: number;
}

async function fetchPositions(): Promise<Position[]> {
  try {
    const response = await externalApi.get<ApiResponse>(
      '/organization-svc/position/get',
    );

    const apiPositions = response.data?.data || [];

    return apiPositions.map((d) => ({
      id: d.pos_id,
      pos_name: d.pos_name,
      pos_status: d.pos_status,
      poscodeId: d.pos_code_id,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch positions';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

export async function createPosition(
  prisma: PrismaService,
  // createUnitDto: CreateUnitDto,
) {
  const positionsData = await fetchPositions();

  if (!positionsData.length) {
    throw new Error('No positions data retrieved from external API');
  }

  let updated = 0;
  let created = 0;

  const existing = await prisma.position.findMany({
    select: { id: true },
  });
  const existingIds = new Set(existing.map((e) => e.id));

  const batchSize = 50;

  for (let i = 0; i < positionsData.length; i += batchSize) {
    const batch = positionsData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      await prisma.position.upsert({
        where: { id: d.id },
        update: {
          pos_name: d.pos_name,
          pos_status: d.pos_status,
          poscodeId: d.poscodeId,
        },
        create: {
          id: d.id,
          pos_name: d.pos_name,
          pos_status: d.pos_status,
          poscodeId: d.poscodeId,
        },
      });
    }
  }

  return {
    success: true,
    total: positionsData.length,
    updated,
    created,
    message: 'Position synced successfully',
  };
}
