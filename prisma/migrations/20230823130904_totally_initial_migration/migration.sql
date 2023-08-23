-- CreateEnum
CREATE TYPE "GenomeAssembly" AS ENUM ('chromosome', 'scaffold');

-- CreateEnum
CREATE TYPE "OhnologyRelation" AS ENUM ('r1', 'r2');

-- CreateTable
CREATE TABLE "GenomeSource" (
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GenomeSource_pkey" PRIMARY KEY ("sourceId")
);

-- CreateTable
CREATE TABLE "Species" (
    "speciesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "assembly" "GenomeAssembly" NOT NULL DEFAULT 'chromosome',
    "outgroup" BOOLEAN NOT NULL DEFAULT false,
    "reconstruction" BOOLEAN NOT NULL DEFAULT false,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("speciesId")
);

-- CreateTable
CREATE TABLE "Scaffold" (
    "scaffoldId" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "speciesId" TEXT NOT NULL,

    CONSTRAINT "Scaffold_pkey" PRIMARY KEY ("speciesId","scaffoldId")
);

-- CreateTable
CREATE TABLE "Segment" (
    "segmentId" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "speciesId" TEXT NOT NULL,
    "scaffoldId" TEXT NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("speciesId","scaffoldId","segmentId")
);

-- CreateTable
CREATE TABLE "Gene" (
    "geneId" TEXT NOT NULL,
    "proteinId" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "pvc" INTEGER,
    "pgc" INTEGER,
    "speciesId" TEXT NOT NULL,
    "scaffoldId" TEXT,
    "segmentId" TEXT,
    "familyId" TEXT,

    CONSTRAINT "Gene_pkey" PRIMARY KEY ("geneId")
);

-- CreateTable
CREATE TABLE "Family" (
    "familyId" TEXT NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("familyId")
);

-- CreateTable
CREATE TABLE "Ohnology" (
    "relation" "OhnologyRelation" NOT NULL,
    "queryId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "Ohnology_pkey" PRIMARY KEY ("queryId","subjectId")
);

-- CreateTable
CREATE TABLE "Label" (
    "labelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("labelId")
);

-- CreateTable
CREATE TABLE "GeneLabel" (
    "geneId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "GeneLabel_pkey" PRIMARY KEY ("geneId","labelId")
);

-- CreateTable
CREATE TABLE "Tree" (
    "treeId" TEXT NOT NULL,
    "newick" TEXT NOT NULL,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("treeId")
);

-- CreateTable
CREATE TABLE "TreeGene" (
    "treeId" TEXT NOT NULL,
    "geneId" TEXT NOT NULL,

    CONSTRAINT "TreeGene_pkey" PRIMARY KEY ("treeId","geneId")
);

-- CreateTable
CREATE TABLE "TreeSpecies" (
    "treeId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,

    CONSTRAINT "TreeSpecies_pkey" PRIMARY KEY ("treeId","speciesId")
);

-- CreateTable
CREATE TABLE "MsynBlock" (
    "blockId" TEXT NOT NULL,

    CONSTRAINT "MsynBlock_pkey" PRIMARY KEY ("blockId")
);

-- CreateTable
CREATE TABLE "MsynTrack" (
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "blockId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "scaffoldId" TEXT NOT NULL,

    CONSTRAINT "MsynTrack_pkey" PRIMARY KEY ("blockId","scaffoldId")
);

-- CreateTable
CREATE TABLE "MsynGroup" (
    "groupId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "MsynGroup_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "MsynGene" (
    "blockId" TEXT NOT NULL,
    "scaffoldId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "geneId" TEXT NOT NULL,

    CONSTRAINT "MsynGene_pkey" PRIMARY KEY ("blockId","scaffoldId","groupId","geneId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Segment_segmentId_scaffoldId_key" ON "Segment"("segmentId", "scaffoldId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_proteinId_key" ON "Gene"("proteinId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_geneId_scaffoldId_key" ON "Gene"("geneId", "scaffoldId");

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GenomeSource"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scaffold" ADD CONSTRAINT "Scaffold_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("speciesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_speciesId_scaffoldId_fkey" FOREIGN KEY ("speciesId", "scaffoldId") REFERENCES "Scaffold"("speciesId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("speciesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_scaffoldId_speciesId_fkey" FOREIGN KEY ("scaffoldId", "speciesId") REFERENCES "Scaffold"("scaffoldId", "speciesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_scaffoldId_segmentId_fkey" FOREIGN KEY ("scaffoldId", "segmentId") REFERENCES "Segment"("scaffoldId", "segmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("familyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ohnology" ADD CONSTRAINT "Ohnology_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Gene"("geneId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ohnology" ADD CONSTRAINT "Ohnology_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Gene"("geneId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("geneId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("labelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeGene" ADD CONSTRAINT "TreeGene_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("treeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeGene" ADD CONSTRAINT "TreeGene_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("geneId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeSpecies" ADD CONSTRAINT "TreeSpecies_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("treeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeSpecies" ADD CONSTRAINT "TreeSpecies_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("speciesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynTrack" ADD CONSTRAINT "MsynTrack_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "MsynBlock"("blockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynTrack" ADD CONSTRAINT "MsynTrack_speciesId_scaffoldId_fkey" FOREIGN KEY ("speciesId", "scaffoldId") REFERENCES "Scaffold"("speciesId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGroup" ADD CONSTRAINT "MsynGroup_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "MsynBlock"("blockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_blockId_scaffoldId_fkey" FOREIGN KEY ("blockId", "scaffoldId") REFERENCES "MsynTrack"("blockId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MsynGroup"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_geneId_scaffoldId_fkey" FOREIGN KEY ("geneId", "scaffoldId") REFERENCES "Gene"("geneId", "scaffoldId") ON DELETE RESTRICT ON UPDATE CASCADE;
