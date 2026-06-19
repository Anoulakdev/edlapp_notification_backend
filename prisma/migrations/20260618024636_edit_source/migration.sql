/*
  Warnings:

  - You are about to drop the column `sourceId` on the `ProblemDoc` table. All the data in the column will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sourcetypeId` to the `ProblemDoc` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProblemDoc" DROP CONSTRAINT "ProblemDoc_sourceId_fkey";

-- DropIndex
DROP INDEX "ProblemDoc_sourceId_idx";

-- AlterTable
ALTER TABLE "ProblemDoc" DROP COLUMN "sourceId",
ADD COLUMN     "sourcetypeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Source";

-- CreateTable
CREATE TABLE "SourceType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "SourceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemDoc_sourcetypeId_idx" ON "ProblemDoc"("sourcetypeId");

-- AddForeignKey
ALTER TABLE "ProblemDoc" ADD CONSTRAINT "ProblemDoc_sourcetypeId_fkey" FOREIGN KEY ("sourcetypeId") REFERENCES "SourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
