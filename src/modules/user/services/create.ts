import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { externalApi } from '../../../utils/external-api';
import { CreateUserDto } from '../dto/create-user.dto';
import { Employee } from '../../../../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

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

/* =======================
   Fetch Employees from API
======================= */

async function fetchEmployees(
  createUserDto: CreateUserDto,
): Promise<ApiEmployee[]> {
  try {
    const response = await externalApi.get<ApiEmployeeResponse>(
      `/organization-svc/employee/get?search=${encodeURIComponent(createUserDto.username.trim())}`,
    );

    return response.data.data?.employees || [];
  } catch (err: unknown) {
    let message = 'Failed to fetch employees';
    if (err instanceof Error) message = err.message;

    console.error(message);
    throw new Error(message);
  }
}

/* =======================
   Create User with Employee Sync
======================= */

export async function createUser(
  prisma: PrismaService,
  createUserDto: CreateUserDto,
) {
  if (!process.env.DEFAULT_PASSWORD) {
    throw new InternalServerErrorException('DEFAULT_PASSWORD is not defined');
  }

  // Check beforehand if username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: createUserDto.username },
  });

  if (existingUser) {
    throw new ConflictException('Username already exists');
  }

  let employee: Employee | null = await prisma.employee.findUnique({
    where: { emp_code: createUserDto.username },
  });

  let matchedEmployee: ApiEmployee | null = null;

  // Fetch external API employee BEFORE opening a database transaction to prevent connection pool exhaustion
  if (!employee) {
    const employees = await fetchEmployees(createUserDto);
    matchedEmployee =
      employees?.find(
        (emp) => emp.emp_code === createUserDto.username.trim(),
      ) || null;

    if (!matchedEmployee) {
      throw new NotFoundException(
        'Employee not found in local database or external API',
      );
    }
  }

  // Hash password beforehand (doesn't hold DB locks)
  const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10);

  return prisma.$transaction(async (tx) => {
    // Re-verify username uniqueness within transaction
    const userInTx = await tx.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (userInTx) {
      throw new ConflictException('Username already exists');
    }

    if (!employee && matchedEmployee) {
      const officeData = matchedEmployee.office || matchedEmployee.placeOffice;

      const posId =
        officeData?.pos_id && Number(officeData.pos_id) > 0
          ? Number(officeData.pos_id)
          : null;
      const departmentId =
        officeData?.department_id && Number(officeData.department_id) > 0
          ? Number(officeData.department_id)
          : null;
      const divisionId =
        officeData?.division_id && Number(officeData.division_id) > 0
          ? Number(officeData.division_id)
          : null;
      const officeId =
        officeData?.office_id && Number(officeData.office_id) > 0
          ? Number(officeData.office_id)
          : null;
      const unitId =
        officeData?.unit_id && Number(officeData.unit_id) > 0
          ? Number(officeData.unit_id)
          : null;

      employee = await tx.employee.create({
        data: {
          id: matchedEmployee.emp_id,
          first_name: matchedEmployee.first_name_la,
          last_name: matchedEmployee.last_name_la,
          emp_code: matchedEmployee.emp_code,
          status: matchedEmployee.status,
          gender: matchedEmployee.gender,
          tel: matchedEmployee.phone,
          email: matchedEmployee.email,
          empimg: matchedEmployee.image
            ? `${process.env.URL_API}/organization-svc/employee/getEmpImg/${matchedEmployee.emp_code}/${matchedEmployee.image}`
            : null,
          posId,
          departmentId,
          divisionId,
          officeId,
          unitId,
        },
      });
    }

    if (!employee) {
      throw new NotFoundException('Employee could not be resolved');
    }

    // Create User linked to the employee
    const user = await tx.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        employeeId: employee.id,
        roleId: createUserDto.roleId,
        provinceId: createUserDto.provinceId || null,
        districtId: createUserDto.districtId || null,
        branchId: createUserDto.branchId || null,
        repairDistrictId: createUserDto.repairDistrictId || null,
      },
      select: {
        id: true,
        username: true,
        roleId: true,
        provinceId: true,
        districtId: true,
        branchId: true,
        repairDistrictId: true,
        employee: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'User and Employee created successfully',
      data: user,
    };
  });
}
