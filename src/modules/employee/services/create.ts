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

async function fetchEmployeesBatch(
  empCodeString: string,
): Promise<ApiEmployee[]> {
  try {
    const response = await externalApi.get<ApiEmployeeResponse>(
      `/organization-svc/employee/get?search=${empCodeString}`,
    );

    return response.data.data?.employees || [];
  } catch (err: unknown) {
    console.error(
      `Failed to fetch employees batch for search string: ${empCodeString}`,
      err,
    );
    return [];
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
  const batchSize = 200; // ปรับเป็น 200 คนต่อกลุ่ม เพื่อความคุ้มค่าของ HTTP Request และความเร็ว

  // 2. แบ่งกลุ่มพนักงานเป็นกลุ่มย่อย
  const batches = chunkArray(localEmployees, batchSize);

  // 3. วนลูปอัปเดตไปทีละกลุ่มแบบ Sequential
  for (const batch of batches) {
    const empCodes = batch.map((emp) => emp.emp_code).filter(Boolean);
    if (!empCodes.length) continue;

    const empCodeString = empCodes.join(',');

    // ดึงข้อมูลจาก API เฉพาะพนักงานในกลุ่มปัจจุบัน
    const apiEmployees = await fetchEmployeesBatch(empCodeString);
    if (!apiEmployees.length) continue;

    const updatePromises: any[] = [];

    for (const emp of apiEmployees) {
      const localEmp = localEmpMap.get(emp.emp_id);
      if (!localEmp) continue;

      const apiImgUrl = emp.image
        ? `${process.env.URL_API}/organization-svc/employee/getEmpImg/${emp.emp_code}/${emp.image}`
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
        localEmp.posId !== (emp.office?.pos_id || null) ||
        localEmp.departmentId !== (emp.office?.department_id || null) ||
        localEmp.divisionId !== (emp.office?.division_id || null) ||
        localEmp.officeId !== (emp.office?.office_id || null) ||
        localEmp.unitId !== (emp.office?.unit_id || null);

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
              posId: emp.office?.pos_id || null,
              departmentId: emp.office?.department_id || null,
              divisionId: emp.office?.division_id || null,
              officeId: emp.office?.office_id || null,
              unitId: emp.office?.unit_id || null,
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
