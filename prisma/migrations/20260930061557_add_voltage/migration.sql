-- AlterTable
ALTER TABLE "CutpowerDoc" ADD COLUMN     "voltageId" INTEGER;

-- AlterTable
ALTER TABLE "EmergencyDoc" ADD COLUMN     "voltageId" INTEGER;

-- AlterTable
ALTER TABLE "TurnoffDoc" ADD COLUMN     "voltageId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActiveAt" TIMESTAMPTZ(0),
ADD COLUMN     "lastLoginAt" TIMESTAMPTZ(0);

-- CreateTable
CREATE TABLE "TypeEquipment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255),
    "actived" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "TypeEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "typeEquipmentId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "actived" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeUnit" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "actived" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "TypeUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemEquipment" (
    "id" SERIAL NOT NULL,
    "problemAssignId" INTEGER NOT NULL,
    "typeEquipmentId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "typeUnitId" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "ProblemEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voltage" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "actived" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Voltage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemEquipment_problemAssignId_idx" ON "ProblemEquipment"("problemAssignId");

-- CreateIndex
CREATE INDEX "ProblemEquipment_equipmentId_idx" ON "ProblemEquipment"("equipmentId");

-- CreateIndex
CREATE INDEX "ProblemEquipment_typeUnitId_idx" ON "ProblemEquipment"("typeUnitId");

-- AddForeignKey
ALTER TABLE "TurnoffDoc" ADD CONSTRAINT "TurnoffDoc_voltageId_fkey" FOREIGN KEY ("voltageId") REFERENCES "Voltage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyDoc" ADD CONSTRAINT "EmergencyDoc_voltageId_fkey" FOREIGN KEY ("voltageId") REFERENCES "Voltage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutpowerDoc" ADD CONSTRAINT "CutpowerDoc_voltageId_fkey" FOREIGN KEY ("voltageId") REFERENCES "Voltage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeEquipment" ADD CONSTRAINT "TypeEquipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_typeEquipmentId_fkey" FOREIGN KEY ("typeEquipmentId") REFERENCES "TypeEquipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemEquipment" ADD CONSTRAINT "ProblemEquipment_problemAssignId_fkey" FOREIGN KEY ("problemAssignId") REFERENCES "ProblemAssign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemEquipment" ADD CONSTRAINT "ProblemEquipment_typeEquipmentId_fkey" FOREIGN KEY ("typeEquipmentId") REFERENCES "TypeEquipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemEquipment" ADD CONSTRAINT "ProblemEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemEquipment" ADD CONSTRAINT "ProblemEquipment_typeUnitId_fkey" FOREIGN KEY ("typeUnitId") REFERENCES "TypeUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
