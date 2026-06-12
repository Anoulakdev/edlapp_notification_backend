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
      `/organization-svc/employee/get?search=${createUserDto.username}`,
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

  // Hash password beforehand (since it doesn't depend on DB state)
  const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10);

  return prisma.$transaction(async (tx) => {
    // Check if username already exists
    const existingUser = await tx.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    let employee: Employee | null = await tx.employee.findUnique({
      where: { emp_code: createUserDto.username },
    });

    if (!employee) {
      const employees = await fetchEmployees(createUserDto);
      const matchedEmployee = employees?.find(
        (emp) => emp.emp_code === createUserDto.username,
      );

      if (!matchedEmployee) {
        throw new NotFoundException(
          'Employee not found in local database or external API',
        );
      }

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
          posId: matchedEmployee.office?.pos_id || null,
          departmentId: matchedEmployee.office?.department_id || null,
          divisionId: matchedEmployee.office?.division_id || null,
          officeId: matchedEmployee.office?.office_id || null,
          unitId: matchedEmployee.office?.unit_id || null,
        },
      });
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
      },
      select: {
        id: true,
        username: true,
        roleId: true,
        provinceId: true,
        districtId: true,
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
