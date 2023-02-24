/*
  Warnings:

  - Added the required column `scaffoldId` to the `Gene` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gene" ADD COLUMN     "scaffoldId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES "Scaffold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
