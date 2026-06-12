import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiOffice {
  office_id: number;
  office_name: string;
  office_code: string | null;
  office_status: string;
  division_id: number | null;
}

interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiOffice[];
}

interface Office {
  id: number;
  office_name: string;
  office_code: string | null;
  office_status: string;
  divisionId: number | null;
}

async function fetchOffices(): Promise<Office[]> {
  try {
    const response = await externalApi.get<ApiResponse>(
      '/organization-svc/office/get',
    );
    const apiOffices = response.data?.data || [];

    return apiOffices.map((o) => ({
      id: o.office_id,
      office_name: o.office_name,
      office_code: o.office_code,
      office_status: o.office_status,
      divisionId: o.division_id,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch offices';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

export async function createOffice(
  prisma: PrismaService,
  // createOfficeDto: CreateOfficeDto,
) {
  const officesData = await fetchOffices();

  if (Array.isArray(officesData) && officesData.length === 0) {
    throw new Error('No offices data retrieved from external API');
  }

  const existing = await prisma.office.findMany({
    select: { id: true },
  });

  const existingIds = new Set(existing.map((d) => d.id));

  // ดึง ID ของ Division ที่มีอยู่เพื่อป้องกัน ForeignKeyConstraintViolation
  const existingDivisions = await prisma.division.findMany({
    select: { id: true },
  });
  const divisionIds = new Set(existingDivisions.map((d) => d.id));

  let updated = 0;
  let created = 0;

  const batchSize = 50;

  for (let i = 0; i < officesData.length; i += batchSize) {
    const batch = officesData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      const divisionId =
        d.divisionId !== null && divisionIds.has(d.divisionId)
          ? d.divisionId
          : null;

      await prisma.office.upsert({
        where: { id: d.id },
        update: {
          office_name: d.office_name,
          office_code: d.office_code,
          office_status: d.office_status,
          divisionId: divisionId,
        },
        create: {
          id: d.id,
          office_name: d.office_name,
          office_code: d.office_code,
          office_status: d.office_status,
          divisionId: divisionId,
        },
      });
    }
  }

  return {
    success: true,
    total: officesData.length,
    updated,
    created,
    message: 'Offices synced successfully',
  };
}
