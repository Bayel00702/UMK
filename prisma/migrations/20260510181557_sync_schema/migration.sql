/*
  Warnings:

  - The `testType` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "testType",
ADD COLUMN     "testType" "TestType" NOT NULL DEFAULT 'TEST';

-- AlterTable
ALTER TABLE "TestResult" ALTER COLUMN "testType" SET DEFAULT 'TEST';
