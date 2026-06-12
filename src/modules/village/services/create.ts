import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiVillage {
  village_id: number;
  village_name: string;
  village_code: string | null;
  district_code: string;
}

interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiVillage[];
}

interface Village {
  id: number;
  village_name: string;
  village_code: string | null;
  districtCode: string;
}

// ฟังก์ชันดึงข้อมูล department
async function fetchVillages(): Promise<Village[]> {
  // เรียก API ดึง departments
  try {
    const response = await externalApi.get<ApiResponse>(
      '/address-svc/village/village',
    );

    const apiVillages = response.data?.data || [];

    return apiVillages.map((d) => ({
      id: d.village_id,
      village_name: d.village_name,
      village_code: d.village_code,
      districtCode: d.district_code,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch provinces';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

// ฟังก์ชัน createDepartment
export async function createVillage(prisma: PrismaService) {
  const villagesData = await fetchVillages();

  if (Array.isArray(villagesData) && villagesData.length === 0) {
    throw new Error('No villages data retrieved from external API');
  }

  const existing = await prisma.village.findMany({
    select: { id: true },
  });

  const existingIds = new Set(existing.map((d) => d.id));

  let updated = 0;
  let created = 0;

  const batchSize = 50;

  for (let i = 0; i < villagesData.length; i += batchSize) {
    const batch = villagesData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      await prisma.village.upsert({
        where: { id: d.id },
        update: {
          village_name: d.village_name,
          village_code: d.village_code,
          districtCode: d.districtCode,
        },
        create: {
          id: d.id,
          village_name: d.village_name,
          village_code: d.village_code,
          districtCode: d.districtCode,
        },
      });
    }
  }

  return {
    success: true,
    total: villagesData.length,
    updated,
    created,
    message: 'villages synced successfully',
  };
}
