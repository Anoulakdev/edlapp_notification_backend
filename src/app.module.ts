import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
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
import { RegistermeterModule } from './modules/registermeter/registermeter.module';
import { TopicModule } from './modules/topic/topic.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { BranchModule } from './modules/branch/branch.module';
import { RepairdistrictModule } from './modules/repairdistrict/repairdistrict.module';
import { MessageautoModule } from './modules/messageauto/messageauto.module';
import { ProblemtypeModule } from './modules/problemtype/problemtype.module';
import { ProblemstatusModule } from './modules/problemstatus/problemstatus.module';
import { ProblemdocModule } from './modules/problemdoc/problemdoc.module';
import { ReportModule } from './modules/report/report.module';
import { PaymentModule } from './modules/payment/payment.module';

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
    RegistermeterModule,
    TopicModule,
    ConversationModule,
    BranchModule,
    RepairdistrictModule,
    MessageautoModule,
    ProblemtypeModule,
    ProblemstatusModule,
    ProblemdocModule,
    ReportModule,
    PaymentModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: Number(config.get('THROTTLE_TTL')) || 60000,
          limit: Number(config.get('THROTTLE_LIMIT')) || 100,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
