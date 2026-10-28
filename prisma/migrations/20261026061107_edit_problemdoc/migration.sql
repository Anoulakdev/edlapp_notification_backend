/*
  Warnings:

  - You are about to drop the column `typeEquipmentId` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `typeEquipmentId` on the `ProblemEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `typeUnitId` on the `ProblemEquipment` table. All the data in the column will be lost.
  - You are about to drop the `TypeEquipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeUnit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `branchId` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_typeEquipmentId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemEquipment" DROP CONSTRAINT "ProblemEquipment_typeEquipmentId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemEquipment" DROP CONSTRAINT "ProblemEquipment_typeUnitId_fkey";

-- DropForeignKey
ALTER TABLE "TypeEquipment" DROP CONSTRAINT "TypeEquipment_createdById_fkey";

-- DropIndex
DROP INDEX "ProblemEquipment_typeEquipmentId_idx";

-- DropIndex
DROP INDEX "ProblemEquipment_typeUnitId_idx";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "typeEquipmentId",
ADD COLUMN     "branchId" INTEGER NOT NULL,
ADD COLUMN     "unit" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "ProblemAssign" ADD COLUMN     "carRepair" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "typeRepairId" INTEGER,
ADD COLUMN     "voltageId" INTEGER;

-- AlterTable
ALTER TABLE "ProblemDoc" ADD COLUMN     "parentProblemId" INTEGER;

-- AlterTable
ALTER TABLE "ProblemEquipment" DROP COLUMN "typeEquipmentId",
DROP COLUMN "typeUnitId";

-- DropTable
DROP TABLE "TypeEquipment";

-- DropTable
DROP TABLE "TypeUnit";

-- CreateTable
CREATE TABLE "TypeRepair" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "actived" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "TypeRepair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Equipment_branchId_idx" ON "Equipment"("branchId");

-- CreateIndex
CREATE INDEX "ProblemAssign_voltageId_idx" ON "ProblemAssign"("voltageId");

-- CreateIndex
CREATE INDEX "ProblemAssign_typeRepairId_idx" ON "ProblemAssign"("typeRepairId");

-- CreateIndex
CREATE INDEX "ProblemDoc_parentProblemId_idx" ON "ProblemDoc"("parentProblemId");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_parentProblemId_fkey" FOREIGN KEY ("parentProblemId") REFERENCES "ProblemDoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAssign" ADD CONSTRAINT "ProblemAssign_voltageId_fkey" FOREIGN KEY ("voltageId") REFERENCES "Voltage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAssign" ADD CONSTRAINT "ProblemAssign_typeRepairId_fkey" FOREIGN KEY ("typeRepairId") REFERENCES "TypeRepair"("id") ON DELETE SET NULL ON UPDATE CASCADE;
