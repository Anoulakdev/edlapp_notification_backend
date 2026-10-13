import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';

interface ApiEmployeeOffice {
  pos_id?: number | null;
  department_id?: number | null;
  division_id?: number | null;
  office_id?: number | null;
  unit_id?: number | null;
}

interface ApiEmployee {
  emp_id: number;
  first_name_la: string;
  last_name_la: string;
  emp_code: string;
  status: string;
  gender: string;
  phone: string;
  email: string;
  image: string;
  office?: ApiEmployeeOffice | null;
  placeOffice?: ApiEmployeeOffice | null;
}

interface ApiEmployeeResponse {
  statusCode?: number;
  message?: string;
  data?: {
    total_record?: number;
    employees?: ApiEmployee[];
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function fetchEmployeeByCode(
  empCode: string,
): Promise<ApiEmployee | null> {
  try {
    const response = await externalApi.get<ApiEmployeeResponse>(
      `/organization-svc/employee/get?search=${encodeURIComponent(empCode.trim())}`,
    );

    const employees = response.data.data?.employees || [];
    return (
      employees.find((e) => e.emp_code === empCode.trim()) ||
      employees[0] ||
      null
    );
  } catch (err: unknown) {
    console.error(`Failed to fetch employee for code: ${empCode}`, err);
    return null;
  }
}

export async function updateEmployee(prisma: PrismaService) {
  // 1. ดึงข้อมูลพนักงานทั้งหมดใน Local DB (พร้อมฟิลด์ทั้งหมดสำหรับทำ Diff check)
  const localEmployees = await prisma.employee.findMany({
    select: {
      id: true,
      emp_code: true,
      first_name: true,
      last_name: true,
      status: true,
      gender: true,
      tel: true,
      email: true,
      empimg: true,
      posId: true,
      departmentId: true,
      divisionId: true,
      officeId: true,
      unitId: true,
    },
  });

  if (!localEmployees.length) {
    return {
      success: true,
      total: 0,
      updated: 0,
      message: 'No employees in local database to sync',
    };
  }

  // สร้าง Map ค้นหาพนักงาน Local เพื่อให้เปรียบเทียบใน Memory ได้เร็วขึ้น
  const localEmpMap = new Map(localEmployees.map((emp) => [emp.id, emp]));

  let updatedCount = 0;
  const batchSize = 10; // ดึงทีละ 10 คนแบบ Concurrent เพื่อความเร็วและไม่ให้ API ภายนอกรับโหลดหนักเกินไป

  // 2. แบ่งกลุ่มพนักงานเป็นกลุ่มย่อย
  const batches = chunkArray(localEmployees, batchSize);

  // 3. วนลูปอัปเดตไปทีละกลุ่มแบบ Sequential
  for (const batch of batches) {
    // ดึงข้อมูลพนักงานจาก API ทีละคนแบบ Concurrent
    const fetchedResults = await Promise.all(
      batch.map((emp) => fetchEmployeeByCode(emp.emp_code)),
    );

    const apiEmployees = fetchedResults.filter((e): e is ApiEmployee =>
      Boolean(e),
    );
    if (!apiEmployees.length) continue;

    const updatePromises: any[] = [];

    for (const emp of apiEmployees) {
      const localEmp = localEmpMap.get(emp.emp_id);
      if (!localEmp) continue;

      const apiImgUrl = emp.image
        ? `${process.env.URL_API}/organization-svc/employee/getEmpImg/${emp.emp_code}/${emp.image}`
        : null;

      // ดึง posId จาก office หรือ placeOffice (ต้องเป็นตัวเลข > 0 เท่านั้น)
      const posId =
        emp.office?.pos_id && Number(emp.office.pos_id) > 0
          ? Number(emp.office.pos_id)
          : emp.placeOffice?.pos_id && Number(emp.placeOffice.pos_id) > 0
            ? Number(emp.placeOffice.pos_id)
            : null;

      const departmentId =
        emp.office?.department_id && Number(emp.office.department_id) > 0
          ? Number(emp.office.department_id)
          : emp.placeOffice?.department_id &&
              Number(emp.placeOffice.department_id) > 0
            ? Number(emp.placeOffice.department_id)
            : null;

      const divisionId =
        emp.office?.division_id && Number(emp.office.division_id) > 0
          ? Number(emp.office.division_id)
          : emp.placeOffice?.division_id &&
              Number(emp.placeOffice.division_id) > 0
            ? Number(emp.placeOffice.division_id)
            : null;

      const officeId =
        emp.office?.office_id && Number(emp.office.office_id) > 0
          ? Number(emp.office.office_id)
          : emp.placeOffice?.office_id && Number(emp.placeOffice.office_id) > 0
            ? Number(emp.placeOffice.office_id)
            : null;

      const unitId =
        emp.office?.unit_id && Number(emp.office.unit_id) > 0
          ? Number(emp.office.unit_id)
          : emp.placeOffice?.unit_id && Number(emp.placeOffice.unit_id) > 0
            ? Number(emp.placeOffice.unit_id)
            : null;

      // ตรวจสอบข้อมูลว่ามีการเปลี่ยนแปลงจริงหรือไม่
      const hasChanged =
        localEmp.first_name !== emp.first_name_la ||
        localEmp.last_name !== emp.last_name_la ||
        localEmp.status !== emp.status ||
        localEmp.gender !== emp.gender ||
        localEmp.tel !== emp.phone ||
        localEmp.email !== emp.email ||
        localEmp.empimg !== apiImgUrl ||
        localEmp.posId !== posId ||
        localEmp.departmentId !== departmentId ||
        localEmp.divisionId !== divisionId ||
        localEmp.officeId !== officeId ||
        localEmp.unitId !== unitId;

      // ถ้าเปลี่ยนแปลงจริง ค่อย push ใส่ Promises ไปสั่ง update ฐานข้อมูล
      if (hasChanged) {
        updatedCount++;
        updatePromises.push(
          prisma.employee.update({
            where: { id: emp.emp_id },
            data: {
              first_name: emp.first_name_la,
              last_name: emp.last_name_la,
              status: emp.status,
              gender: emp.gender,
              tel: emp.phone,
              email: emp.email,
              empimg: apiImgUrl,
              posId,
              departmentId,
              divisionId,
              officeId,
              unitId,
            },
          }),
        );
      }
    }

    // อัปเดตผ่าน Transaction ในแต่ละ Batch (อัปเดตเฉพาะแถวที่มีการเปลี่ยนแปลง)
    if (updatePromises.length > 0) {
      await prisma.$transaction(updatePromises);
    }
  }

  return {
    success: true,
    total: localEmployees.length,
    updated: updatedCount,
    message: 'Employee synced successfully',
  };
}
