import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiProvince {
  province_id: number;
  province_name: string;
  province_code: string;
  province_short: string;
  branch_code: string;
}

interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiProvince[];
}

interface Province {
  id: number;
  province_name: string;
  province_code: string;
  province_short: string;
  branch_code: string;
}

// ฟังก์ชันดึงข้อมูล department
async function fetchProvinces(): Promise<Province[]> {
  // เรียก API ดึง departments
  try {
    const response = await externalApi.get<ApiResponse>(
      '/address-svc/province/provinces',
    );

    const apiProvinces = response.data?.data || [];

    return apiProvinces.map((d) => ({
      id: d.province_id,
      province_name: d.province_name,
      province_code: d.province_code,
      province_short: d.province_short,
      branch_code: d.branch_code,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch provinces';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

// ฟังก์ชัน createDepartment
export async function createProvince(prisma: PrismaService) {
  const provincesData = await fetchProvinces();

  if (Array.isArray(provincesData) && provincesData.length === 0) {
    throw new Error('No provinces data retrieved from external API');
  }

  const existing = await prisma.province.findMany({
    select: { id: true },
  });

  const existingIds = new Set(existing.map((d) => d.id));

  let updated = 0;
  let created = 0;

  const batchSize = 50;

  for (let i = 0; i < provincesData.length; i += batchSize) {
    const batch = provincesData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      await prisma.province.upsert({
        where: { id: d.id },
        update: {
          province_name: d.province_name,
          province_code: d.province_code,
          province_short: d.province_short,
          branch_code: d.branch_code,
        },
        create: {
          id: d.id,
          province_name: d.province_name,
          province_code: d.province_code,
          province_short: d.province_short,
          branch_code: d.branch_code,
        },
      });
    }
  }

  return {
    success: true,
    total: provincesData.length,
    updated,
    created,
    message: 'provinces synced successfully',
  };
}
