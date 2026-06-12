import { Injectable } from '@nestjs/common';
// import { CreateEmployeeDto } from './dto/create-employee.dto';
// import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { updateEmployee } from './services/create';
import { findAllEmployee } from './services/findall';
import { findOneEmployee } from './services/findone';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  create() {
    return updateEmployee(this.prisma);
  }

  findAll() {
    return findAllEmployee(this.prisma);
  }

  findOne(id: number) {
    return findOneEmployee(this.prisma, id);
  }
}
