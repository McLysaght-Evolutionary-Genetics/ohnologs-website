/*
  Warnings:

  - The primary key for the `MsynTrack` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `speciesId` to the `MsynGene` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_blockId_scaffoldId_fkey";

-- AlterTable
ALTER TABLE "MsynGene" ADD COLUMN     "speciesId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MsynTrack" DROP CONSTRAINT "MsynTrack_pkey",
ADD CONSTRAINT "MsynTrack_pkey" PRIMARY KEY ("blockId", "speciesId", "scaffoldId");

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_blockId_speciesId_scaffoldId_fkey" FOREIGN KEY ("blockId", "speciesId", "scaffoldId") REFERENCES "MsynTrack"("blockId", "speciesId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;
