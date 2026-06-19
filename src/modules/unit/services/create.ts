import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiUnit {
  unit_id: number;
  unit_name: string;
  unit_code: string | null;
  unit_status: string;
  unit_type: string | null;
  division_id: number | null;
  office_id: number | null;
}
interface ApiResponse {
  message: string;
  statusCode: number;
  data: ApiUnit[];
}

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string | null;
  unit_status: string;
  unit_type: string | null;
  divisionId: number | null;
  officeId: number | null;
}

async function fetchUnits(): Promise<Unit[]> {
  try {
    const response = await externalApi.get<ApiResponse>(
      '/organization-svc/unit/get',
    );

    const apiUnits = response.data?.data || [];

    return apiUnits.map((u) => ({
      id: u.unit_id,
      unit_name: u.unit_name,
      unit_code: u.unit_code,
      unit_status: u.unit_status,
      unit_type: u.unit_type,
      divisionId: u.division_id,
      officeId: u.office_id,
    }));
  } catch (err: unknown) {
    let message = 'Failed to fetch units';
    if (err instanceof Error) message = err.message;
    console.error(message);
    throw new Error(message);
  }
}

export async function createUnit(
  prisma: PrismaService,
  // createUnitDto: CreateUnitDto,
) {
  const unitsData = await fetchUnits();

  if (Array.isArray(unitsData) && unitsData.length === 0) {
    throw new Error('No units data retrieved from external API');
  }

  const existing = await prisma.unit.findMany({
    select: { id: true },
  });

  const existingIds = new Set(existing.map((d) => d.id));

  // ดึง ID ของ Division และ Office ที่มีอยู่เพื่อป้องกัน ForeignKeyConstraintViolation
  const existingDivisions = await prisma.division.findMany({
    select: { id: true },
  });
  const divisionIds = new Set(existingDivisions.map((d) => d.id));

  const existingOffices = await prisma.office.findMany({
    select: { id: true },
  });
  const officeIds = new Set(existingOffices.map((o) => o.id));

  let updated = 0;
  let created = 0;

  const batchSize = 50;

  for (let i = 0; i < unitsData.length; i += batchSize) {
    const batch = unitsData.slice(i, i + batchSize);

    for (const d of batch) {
      const isNew = !existingIds.has(d.id);

      if (isNew) created++;
      else updated++;

      const divisionId =
        d.divisionId !== null && divisionIds.has(d.divisionId)
          ? d.divisionId
          : null;
      const officeId =
        d.officeId !== null && officeIds.has(d.officeId) ? d.officeId : null;

      await prisma.unit.upsert({
        where: { id: d.id },
        update: {
          unit_name: d.unit_name,
          unit_code: d.unit_code,
          unit_status: d.unit_status,
          unit_type: d.unit_type,
          divisionId: divisionId,
          officeId: officeId,
        },
        create: {
          id: d.id,
          unit_name: d.unit_name,
          unit_code: d.unit_code,
          unit_status: d.unit_status,
          unit_type: d.unit_type,
          divisionId: divisionId,
          officeId: officeId,
        },
      });
    }
  }

  return {
    success: true,
    total: unitsData.length,
    updated,
    created,
    message: 'Units synced successfully',
  };
}
