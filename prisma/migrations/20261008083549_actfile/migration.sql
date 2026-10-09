/*
  Warnings:

  - Added the required column `actFile` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "actFile" VARCHAR(255) NOT NULL;
