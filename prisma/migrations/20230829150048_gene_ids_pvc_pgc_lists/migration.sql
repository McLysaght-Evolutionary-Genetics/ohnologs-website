/*
  Warnings:

  - The `pvc` column on the `Gene` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pgc` column on the `Gene` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `GeneLabel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `geneId` on the `GeneLabel` table. All the data in the column will be lost.
  - The primary key for the `MsynGene` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `geneId` on the `MsynGene` table. All the data in the column will be lost.
  - The primary key for the `TreeGene` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `geneId` on the `TreeGene` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proteinId,scaffoldId]` on the table `Gene` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `proteinId` to the `GeneLabel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinId` to the `MsynGene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinId` to the `TreeGene` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GeneLabel" DROP CONSTRAINT "GeneLabel_geneId_fkey";

-- DropForeignKey
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_geneId_scaffoldId_fkey";

-- DropForeignKey
ALTER TABLE "Ohnology" DROP CONSTRAINT "Ohnology_queryId_fkey";

-- DropForeignKey
ALTER TABLE "Ohnology" DROP CONSTRAINT "Ohnology_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "TreeGene" DROP CONSTRAINT "TreeGene_geneId_fkey";

-- DropIndex
DROP INDEX "Gene_geneId_scaffoldId_key";

-- AlterTable
ALTER TABLE "Gene" DROP COLUMN "pvc",
ADD COLUMN     "pvc" INTEGER[],
DROP COLUMN "pgc",
ADD COLUMN     "pgc" INTEGER[];

-- AlterTable
ALTER TABLE "GeneLabel" DROP CONSTRAINT "GeneLabel_pkey",
DROP COLUMN "geneId",
ADD COLUMN     "proteinId" TEXT NOT NULL,
ADD CONSTRAINT "GeneLabel_pkey" PRIMARY KEY ("proteinId", "labelId");

-- AlterTable
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_pkey",
DROP COLUMN "geneId",
ADD COLUMN     "proteinId" TEXT NOT NULL,
ADD CONSTRAINT "MsynGene_pkey" PRIMARY KEY ("blockId", "scaffoldId", "groupId", "proteinId");

-- AlterTable
ALTER TABLE "TreeGene" DROP CONSTRAINT "TreeGene_pkey",
DROP COLUMN "geneId",
ADD COLUMN     "proteinId" TEXT NOT NULL,
ADD CONSTRAINT "TreeGene_pkey" PRIMARY KEY ("treeId", "proteinId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_proteinId_scaffoldId_key" ON "Gene"("proteinId", "scaffoldId");

-- AddForeignKey
ALTER TABLE "Ohnology" ADD CONSTRAINT "Ohnology_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Gene"("proteinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ohnology" ADD CONSTRAINT "Ohnology_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Gene"("proteinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_proteinId_fkey" FOREIGN KEY ("proteinId") REFERENCES "Gene"("proteinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeGene" ADD CONSTRAINT "TreeGene_proteinId_fkey" FOREIGN KEY ("proteinId") REFERENCES "Gene"("proteinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_proteinId_scaffoldId_fkey" FOREIGN KEY ("proteinId", "scaffoldId") REFERENCES "Gene"("proteinId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;
