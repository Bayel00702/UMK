/*
  Warnings:

  - Made the column `testType` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "testType" SET NOT NULL,
ALTER COLUMN "testType" SET DEFAULT 'TEST';

-- AlterTable
ALTER TABLE "TestResult" ADD COLUMN     "testType" TEXT NOT NULL DEFAULT 'TEST';
