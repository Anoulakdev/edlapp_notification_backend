-- AlterTable
ALTER TABLE "EmergencyAddress" ADD COLUMN     "districtId" INTEGER;

-- AlterTable
ALTER TABLE "EmergencyDoc" ADD COLUMN     "emergencyStatusId" INTEGER;

-- AlterTable
ALTER TABLE "TurnoffAddress" ADD COLUMN     "districtId" INTEGER;

-- AlterTable
ALTER TABLE "TurnoffDoc" ADD COLUMN     "turnoffStatusId" INTEGER;

-- CreateTable
CREATE TABLE "TurnoffStatus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "TurnoffStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyStatus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "EmergencyStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ(0) NOT NULL,
    "endDate" TIMESTAMPTZ(0) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmergencyAddress_districtId_idx" ON "EmergencyAddress"("districtId");

-- CreateIndex
CREATE INDEX "TurnoffAddress_districtId_idx" ON "TurnoffAddress"("districtId");

-- AddForeignKey
ALTER TABLE "TurnoffDoc" ADD CONSTRAINT "TurnoffDoc_turnoffStatusId_fkey" FOREIGN KEY ("turnoffStatusId") REFERENCES "TurnoffStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoffAddress" ADD CONSTRAINT "TurnoffAddress_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyDoc" ADD CONSTRAINT "EmergencyDoc_emergencyStatusId_fkey" FOREIGN KEY ("emergencyStatusId") REFERENCES "EmergencyStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAddress" ADD CONSTRAINT "EmergencyAddress_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
