/*
  Warnings:

  - The primary key for the `MsynGene` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[geneId,scaffoldId]` on the table `Gene` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blockId` to the `MsynGene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scaffoldId` to the `MsynGene` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_geneId_fkey";

-- AlterTable
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_pkey",
ADD COLUMN     "blockId" TEXT NOT NULL,
ADD COLUMN     "scaffoldId" TEXT NOT NULL,
ADD CONSTRAINT "MsynGene_pkey" PRIMARY KEY ("blockId", "scaffoldId", "groupId", "geneId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_geneId_scaffoldId_key" ON "Gene"("geneId", "scaffoldId");

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_blockId_scaffoldId_fkey" FOREIGN KEY ("blockId", "scaffoldId") REFERENCES "MsynTrack"("blockId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_geneId_scaffoldId_fkey" FOREIGN KEY ("geneId", "scaffoldId") REFERENCES "Gene"("geneId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;
