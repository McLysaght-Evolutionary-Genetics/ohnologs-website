/*
  Warnings:

  - You are about to drop the column `name` on the `Gene` table. All the data in the column will be lost.
  - Added the required column `end` to the `Gene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `geneId` to the `Gene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinId` to the `Gene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Gene` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gene" DROP COLUMN "name",
ADD COLUMN     "end" INTEGER NOT NULL,
ADD COLUMN     "geneId" TEXT NOT NULL,
ADD COLUMN     "proteinId" TEXT NOT NULL,
ADD COLUMN     "start" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Genome" (
    "id" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "Genome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenomeState" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GenomeState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenomeSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GenomeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scaffold" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "genomeId" TEXT NOT NULL,

    CONSTRAINT "Scaffold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "scaffoldId" TEXT NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homology" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "Homology_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Genome" ADD CONSTRAINT "Genome_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "GenomeState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Genome" ADD CONSTRAINT "Genome_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GenomeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scaffold" ADD CONSTRAINT "Scaffold_genomeId_fkey" FOREIGN KEY ("genomeId") REFERENCES "Genome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES "Scaffold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homology" ADD CONSTRAINT "Homology_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Gene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homology" ADD CONSTRAINT "Homology_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Gene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
