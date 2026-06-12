import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiDivision {
  division_id: number;
  division_name: string;
  division_code: string;
  division_status: string;
  branch_id: number | null;
  short_name: string | null;
  insur_code: string | null;
  department_id: number;
}
interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiDivision[];
}

interface Division {
  id: number;
  division_name: string;
  division_code: string;
  division_status: string;
  branch_id: number | null;
  short_name: string | null;
  insur_code: string | null;
  departmentId: number;
}

async function fetchDivisions(): Promise<Division[]> {
  try {
    const response = await externalApi.get<ApiResponse>(
      '/organization-svc/division/get',
    );

    const apiDivisions = response.data?.data || [];

    return apiDivisions.map((d) => ({
      id: d.division_id,
      division_name: d.division_name,
      division_code: d.division_code,
      division_status: d.division_status,
      branch_id: d.branch_id,
      short_name: d.short_name,
      insur_code: d.insur_code,
      departmentId: d.department_id,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch divisions';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

export async function createDivision(
  prisma: PrismaService,
  // createDivisionDto: CreateDivisionDto,
) {
  const divisionsData = await fetchDivisions();

  if (Array.isArray(divisionsData) && divisionsData.length === 0) {
    throw new Error('No divisions data retrieved from external API');
  }

  const existing = await prisma.division.findMany({
    select: { id: true },
  });

  const existingIds = new Set(existing.map((d) => d.id));

  let updated = 0;
  let created = 0;

  const batchSize = 50;

  for (let i = 0; i < divisionsData.length; i += batchSize) {
    const batch = divisionsData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      await prisma.division.upsert({
        where: { id: d.id },
        update: {
          division_name: d.division_name,
          division_code: d.division_code,
          division_status: d.division_status,
          branch_id: d.branch_id,
          short_name: d.short_name,
          insur_code: d.insur_code,
          departmentId: d.departmentId,
        },
        create: {
          id: d.id,
          division_name: d.division_name,
          division_code: d.division_code,
          division_status: d.division_status,
          branch_id: d.branch_id,
          short_name: d.short_name,
          insur_code: d.insur_code,
          departmentId: d.departmentId,
        },
      });
    }
  }

  return {
    success: true,
    total: divisionsData.length,
    updated,
    created,
    message: 'Divisions synced successfully',
  };
}
