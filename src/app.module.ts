import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { DivisionModule } from './modules/division/division.module';
import { OfficeModule } from './modules/office/office.module';
import { UnitModule } from './modules/unit/unit.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { PositiongroupModule } from './modules/positiongroup/positiongroup.module';
import { PositioncodeModule } from './modules/positioncode/positioncode.module';
import { PositionModule } from './modules/position/position.module';
import { RoleModule } from './modules/role/role.module';
import { ProvinceModule } from './modules/province/province.module';
import { DistrictModule } from './modules/district/district.module';
import { VillageModule } from './modules/village/village.module';
import { TurnoffdocModule } from './modules/turnoffdoc/turnoffdoc.module';
import { TurnoffassignModule } from './modules/turnoffassign/turnoffassign.module';
import { EmergencydocModule } from './modules/emergencydoc/emergencydoc.module';
import { EmergencyassignModule } from './modules/emergencyassign/emergencyassign.module';
import { SourcetypeModule } from './modules/sourcetype/sourcetype.module';
import { CutpowerdocModule } from './modules/cutpowerdoc/cutpowerdoc.module';
import { MeterstatusModule } from './modules/meterstatus/meterstatus.module';
import { CutpowerassignModule } from './modules/cutpowerassign/cutpowerassign.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    AuthModule,
    DepartmentModule,
    DivisionModule,
    OfficeModule,
    UnitModule,
    EmployeeModule,
    PositiongroupModule,
    PositioncodeModule,
    PositionModule,
    RoleModule,
    ProvinceModule,
    DistrictModule,
    VillageModule,
    TurnoffdocModule,
    TurnoffassignModule,
    EmergencydocModule,
    EmergencyassignModule,
    CutpowerdocModule,
    CutpowerassignModule,
    SourcetypeModule,
    MeterstatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
