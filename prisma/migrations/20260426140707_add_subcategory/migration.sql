/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_subjectId_fkey";

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "subcategory" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
DROP COLUMN "surname";

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
