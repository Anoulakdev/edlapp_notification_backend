-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('edlapp', 'callcenter');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'seen');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'audio', 'location');

-- CreateTable
CREATE TABLE "ExternalUser" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255),
    "tel" VARCHAR(255),

    CONSTRAINT "ExternalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "employeeId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FcmToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "platform" VARCHAR(255) NOT NULL,
    "model" VARCHAR(255) NOT NULL,
    "fcmtoken" VARCHAR(255) NOT NULL,

    CONSTRAINT "FcmToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "emp_code" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "gender" VARCHAR(255),
    "tel" VARCHAR(255),
    "email" VARCHAR(255),
    "empimg" VARCHAR(255),
    "posId" INTEGER,
    "departmentId" INTEGER,
    "divisionId" INTEGER,
    "officeId" INTEGER,
    "unitId" INTEGER,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL,
    "department_name" VARCHAR(255),
    "department_code" VARCHAR(50),
    "department_status" VARCHAR(50) NOT NULL DEFAULT 'A',

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" INTEGER NOT NULL,
    "division_name" VARCHAR(255),
    "division_code" VARCHAR(50),
    "division_status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "branch_id" INTEGER,
    "short_name" VARCHAR(255),
    "insur_code" VARCHAR(255),
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" INTEGER NOT NULL,
    "office_name" VARCHAR(255),
    "office_code" VARCHAR(50),
    "office_status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "divisionId" INTEGER,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL,
    "unit_name" VARCHAR(255),
    "unit_code" VARCHAR(50),
    "unit_status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "unit_type" VARCHAR(50),
    "divisionId" INTEGER,
    "officeId" INTEGER,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionGroup" (
    "id" INTEGER NOT NULL,
    "pos_group_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "PositionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionCode" (
    "id" INTEGER NOT NULL,
    "pos_code_name" VARCHAR(255) NOT NULL,
    "pos_code_status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "posgroupId" INTEGER,

    CONSTRAINT "PositionCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL,
    "pos_name" VARCHAR(255) NOT NULL,
    "pos_status" VARCHAR(50) NOT NULL DEFAULT 'A',
    "poscodeId" INTEGER,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" INTEGER NOT NULL,
    "province_name" VARCHAR(255) NOT NULL,
    "province_code" VARCHAR(255) NOT NULL,
    "province_short" VARCHAR(50) NOT NULL,
    "branch_code" VARCHAR(50) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" INTEGER NOT NULL,
    "provinceCode" TEXT NOT NULL,
    "district_name" VARCHAR(255) NOT NULL,
    "district_code" VARCHAR(50) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" INTEGER NOT NULL,
    "districtCode" TEXT NOT NULL,
    "village_name" VARCHAR(255) NOT NULL,
    "village_code" VARCHAR(50),

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoffDoc" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMPTZ(0) NOT NULL,
    "endDate" TIMESTAMPTZ(0) NOT NULL,
    "startTime" VARCHAR(50),
    "endTime" VARCHAR(50),
    "turnoffFile" VARCHAR(255) NOT NULL,
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "TurnoffDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoffAddress" (
    "id" SERIAL NOT NULL,
    "turnoffId" INTEGER NOT NULL,
    "villageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "TurnoffAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoffAssign" (
    "id" SERIAL NOT NULL,
    "turnoffId" INTEGER NOT NULL,
    "userAppId" INTEGER NOT NULL,
    "docview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "TurnoffAssign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyDoc" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "emergencyDate" TIMESTAMPTZ(0) NOT NULL,
    "startTime" VARCHAR(50),
    "endTime" VARCHAR(50),
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "emergencyImg" VARCHAR(255),
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "EmergencyDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAddress" (
    "id" SERIAL NOT NULL,
    "emergencyId" INTEGER NOT NULL,
    "villageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "EmergencyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAssign" (
    "id" SERIAL NOT NULL,
    "emergencyId" INTEGER NOT NULL,
    "userAppId" INTEGER NOT NULL,
    "docview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "EmergencyAssign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CutpowerDoc" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cutpowerDate" TIMESTAMPTZ(0) NOT NULL,
    "cutpowerFile" VARCHAR(255) NOT NULL,
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "CutpowerDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CutpowerAddress" (
    "id" SERIAL NOT NULL,
    "cutpowerId" INTEGER NOT NULL,
    "villageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "CutpowerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CutpowerAssign" (
    "id" SERIAL NOT NULL,
    "cutpowerId" INTEGER NOT NULL,
    "userAppId" INTEGER NOT NULL,
    "docview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "CutpowerAssign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "SourceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterStatus" (
    "id" SERIAL NOT NULL,
    "edlapp" VARCHAR(255),
    "callcenter" VARCHAR(255),

    CONSTRAINT "MeterStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterMeter" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "accountNear" VARCHAR(255) NOT NULL,
    "billNearImg" VARCHAR(255),
    "idcardImg" VARCHAR(255),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "provinceId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "villageId" INTEGER NOT NULL,
    "meterStatusId" INTEGER NOT NULL,
    "sourcetypeId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "RegisterMeter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAcceptMeter" (
    "id" SERIAL NOT NULL,
    "meterId" INTEGER NOT NULL,
    "userCallId" INTEGER,
    "userProvinceId" INTEGER,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "UserAcceptMeter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "actived" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "externalUserId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMPTZ(0),
    "unreadExternalCount" INTEGER NOT NULL DEFAULT 0,
    "unreadAgentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "edlappId" INTEGER,
    "agentId" INTEGER,
    "mType" "MessageType" NOT NULL DEFAULT 'text',
    "content" TEXT,
    "fileImg" VARCHAR(255),
    "fileAudio" VARCHAR(255),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "MessageStatus" NOT NULL DEFAULT 'sent',
    "seenAt" TIMESTAMPTZ(0),
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "FcmToken_userId_platform_model_key" ON "FcmToken"("userId", "platform", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_emp_code_key" ON "Employee"("emp_code");

-- CreateIndex
CREATE UNIQUE INDEX "Province_province_code_key" ON "Province"("province_code");

-- CreateIndex
CREATE UNIQUE INDEX "District_district_code_key" ON "District"("district_code");

-- CreateIndex
CREATE INDEX "TurnoffDoc_createdById_idx" ON "TurnoffDoc"("createdById");

-- CreateIndex
CREATE INDEX "TurnoffDoc_provinceId_idx" ON "TurnoffDoc"("provinceId");

-- CreateIndex
CREATE INDEX "TurnoffDoc_districtId_idx" ON "TurnoffDoc"("districtId");

-- CreateIndex
CREATE INDEX "TurnoffAddress_turnoffId_idx" ON "TurnoffAddress"("turnoffId");

-- CreateIndex
CREATE INDEX "TurnoffAssign_turnoffId_idx" ON "TurnoffAssign"("turnoffId");

-- CreateIndex
CREATE INDEX "TurnoffAssign_userAppId_idx" ON "TurnoffAssign"("userAppId");

-- CreateIndex
CREATE INDEX "EmergencyDoc_createdById_idx" ON "EmergencyDoc"("createdById");

-- CreateIndex
CREATE INDEX "EmergencyDoc_provinceId_idx" ON "EmergencyDoc"("provinceId");

-- CreateIndex
CREATE INDEX "EmergencyDoc_districtId_idx" ON "EmergencyDoc"("districtId");

-- CreateIndex
CREATE INDEX "EmergencyAddress_emergencyId_idx" ON "EmergencyAddress"("emergencyId");

-- CreateIndex
CREATE INDEX "EmergencyAssign_emergencyId_idx" ON "EmergencyAssign"("emergencyId");

-- CreateIndex
CREATE INDEX "EmergencyAssign_userAppId_idx" ON "EmergencyAssign"("userAppId");

-- CreateIndex
CREATE INDEX "CutpowerDoc_createdById_idx" ON "CutpowerDoc"("createdById");

-- CreateIndex
CREATE INDEX "CutpowerDoc_provinceId_idx" ON "CutpowerDoc"("provinceId");

-- CreateIndex
CREATE INDEX "CutpowerDoc_districtId_idx" ON "CutpowerDoc"("districtId");

-- CreateIndex
CREATE INDEX "CutpowerAddress_cutpowerId_idx" ON "CutpowerAddress"("cutpowerId");

-- CreateIndex
CREATE INDEX "CutpowerAssign_cutpowerId_idx" ON "CutpowerAssign"("cutpowerId");

-- CreateIndex
CREATE INDEX "CutpowerAssign_userAppId_idx" ON "CutpowerAssign"("userAppId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAcceptMeter_meterId_key" ON "UserAcceptMeter"("meterId");

-- CreateIndex
CREATE INDEX "Conversation_externalUserId_idx" ON "Conversation"("externalUserId");

-- CreateIndex
CREATE INDEX "Conversation_topicId_idx" ON "Conversation"("topicId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FcmToken" ADD CONSTRAINT "FcmToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_posId_fkey" FOREIGN KEY ("posId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionCode" ADD CONSTRAINT "PositionCode_posgroupId_fkey" FOREIGN KEY ("posgroupId") REFERENCES "PositionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_poscodeId_fkey" FOREIGN KEY ("poscodeId") REFERENCES "PositionCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceCode_fkey" FOREIGN KEY ("provinceCode") REFERENCES "Province"("province_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_districtCode_fkey" FOREIGN KEY ("districtCode") REFERENCES "District"("district_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffDoc" ADD CONSTRAINT "TurnoffDoc_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffDoc" ADD CONSTRAINT "TurnoffDoc_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffDoc" ADD CONSTRAINT "TurnoffDoc_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffAddress" ADD CONSTRAINT "TurnoffAddress_turnoffId_fkey" FOREIGN KEY ("turnoffId") REFERENCES "TurnoffDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffAddress" ADD CONSTRAINT "TurnoffAddress_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffAssign" ADD CONSTRAINT "TurnoffAssign_turnoffId_fkey" FOREIGN KEY ("turnoffId") REFERENCES "TurnoffDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyDoc" ADD CONSTRAINT "EmergencyDoc_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyDoc" ADD CONSTRAINT "EmergencyDoc_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyDoc" ADD CONSTRAINT "EmergencyDoc_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAddress" ADD CONSTRAINT "EmergencyAddress_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "EmergencyDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAddress" ADD CONSTRAINT "EmergencyAddress_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAssign" ADD CONSTRAINT "EmergencyAssign_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "EmergencyDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerDoc" ADD CONSTRAINT "CutpowerDoc_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerDoc" ADD CONSTRAINT "CutpowerDoc_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerDoc" ADD CONSTRAINT "CutpowerDoc_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerAddress" ADD CONSTRAINT "CutpowerAddress_cutpowerId_fkey" FOREIGN KEY ("cutpowerId") REFERENCES "CutpowerDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerAddress" ADD CONSTRAINT "CutpowerAddress_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerAssign" ADD CONSTRAINT "CutpowerAssign_cutpowerId_fkey" FOREIGN KEY ("cutpowerId") REFERENCES "CutpowerDoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterMeter" ADD CONSTRAINT "RegisterMeter_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterMeter" ADD CONSTRAINT "RegisterMeter_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterMeter" ADD CONSTRAINT "RegisterMeter_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterMeter" ADD CONSTRAINT "RegisterMeter_meterStatusId_fkey" FOREIGN KEY ("meterStatusId") REFERENCES "MeterStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterMeter" ADD CONSTRAINT "RegisterMeter_sourcetypeId_fkey" FOREIGN KEY ("sourcetypeId") REFERENCES "SourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcceptMeter" ADD CONSTRAINT "UserAcceptMeter_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "RegisterMeter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcceptMeter" ADD CONSTRAINT "UserAcceptMeter_userCallId_fkey" FOREIGN KEY ("userCallId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcceptMeter" ADD CONSTRAINT "UserAcceptMeter_userProvinceId_fkey" FOREIGN KEY ("userProvinceId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_externalUserId_fkey" FOREIGN KEY ("externalUserId") REFERENCES "ExternalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_edlappId_fkey" FOREIGN KEY ("edlappId") REFERENCES "ExternalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
