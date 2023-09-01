/*
  Warnings:

  - The primary key for the `MsynGene` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_pkey",
ADD CONSTRAINT "MsynGene_pkey" PRIMARY KEY ("blockId", "speciesId", "scaffoldId", "groupId", "proteinId");
