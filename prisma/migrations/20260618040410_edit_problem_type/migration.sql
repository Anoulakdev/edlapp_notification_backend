/*
  Warnings:

  - Added the required column `createdById` to the `ProblemType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProblemType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProblemType" ADD COLUMN     "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(0) NOT NULL;

-- AddForeignKey
ALTER TABLE "ProblemType" ADD CONSTRAINT "ProblemType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
