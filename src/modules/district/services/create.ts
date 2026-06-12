import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiDistrict {
  district_id: number;
  district_name: string;
  district_code: string;
  province_code: string;
}

interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiDistrict[];
}

interface District {
  id: number;
  district_name: string;
  district_code: string;
  provinceCode: string;
}

// ฟังก์ชันดึงข้อมูล department
async function fetchDistricts(): Promise<District[]> {
  // เรียก API ดึง departments
  try {
    const response = await externalApi.get<ApiResponse>(
      '/address-svc/district/district',
    );

    const apiDistricts = response.data?.data || [];

    return apiDistricts.map((d) => ({
      id: d.district_id,
      district_name: d.district_name,
      district_code: d.district_code,
      provinceCode: d.province_code,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch provinces';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

// ฟังก์ชัน createDepartment
export async function createDistrict(prisma: PrismaService) {
  const districtsData = await fetchDistricts();

  if (Array.isArray(districtsData) && districtsData.length === 0) {
    throw new Error('No districts data retrieved from external API');
  }

  const existing = await prisma.district.findMany({
    select: { id: true },
  });

  const existingIds = new Set(existing.map((d) => d.id));

  let updated = 0;
  let created = 0;

  const batchSize = 50;

  for (let i = 0; i < districtsData.length; i += batchSize) {
    const batch = districtsData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      await prisma.district.upsert({
        where: { id: d.id },
        update: {
          district_name: d.district_name,
          district_code: d.district_code,
          provinceCode: d.provinceCode,
        },
        create: {
          id: d.id,
          district_name: d.district_name,
          district_code: d.district_code,
          provinceCode: d.provinceCode,
        },
      });
    }
  }

  return {
    success: true,
    total: districtsData.length,
    updated,
    created,
    message: 'districts synced successfully',
  };
}
