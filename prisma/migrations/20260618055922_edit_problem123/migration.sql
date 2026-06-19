/*
  Warnings:

  - Made the column `fullName` on table `ProblemDoc` required. This step will fail if there are existing NULL values in that column.
  - Made the column `provinceId` on table `ProblemDoc` required. This step will fail if there are existing NULL values in that column.
  - Made the column `districtId` on table `ProblemDoc` required. This step will fail if there are existing NULL values in that column.
  - Made the column `villageId` on table `ProblemDoc` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProblemDoc" DROP CONSTRAINT "ProblemDoc_districtId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemDoc" DROP CONSTRAINT "ProblemDoc_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemDoc" DROP CONSTRAINT "ProblemDoc_villageId_fkey";

-- AlterTable
ALTER TABLE "ProblemDoc" ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "provinceId" SET NOT NULL,
ALTER COLUMN "districtId" SET NOT NULL,
ALTER COLUMN "villageId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
