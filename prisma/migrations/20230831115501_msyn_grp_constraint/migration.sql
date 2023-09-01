/*
  Warnings:

  - The primary key for the `MsynGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "MsynGene" DROP CONSTRAINT "MsynGene_groupId_fkey";

-- AlterTable
ALTER TABLE "MsynGroup" DROP CONSTRAINT "MsynGroup_pkey",
ADD CONSTRAINT "MsynGroup_pkey" PRIMARY KEY ("groupId", "blockId");

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_groupId_blockId_fkey" FOREIGN KEY ("groupId", "blockId") REFERENCES "MsynGroup"("groupId", "blockId") ON DELETE RESTRICT ON UPDATE CASCADE;
