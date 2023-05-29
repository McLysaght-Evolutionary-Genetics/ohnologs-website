-- CreateEnum
CREATE TYPE "GenomeCompletnesss" AS ENUM ('chromosome', 'scaffold');

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "completness" "GenomeCompletnesss" NOT NULL,
    "version" TEXT NOT NULL,
    "genomeSourceId" TEXT NOT NULL,
    "genomeStateId" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenomeSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GenomeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenomeState" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GenomeState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scaffold" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "speciesId" TEXT NOT NULL,

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
CREATE TABLE "Gene" (
    "id" TEXT NOT NULL,
    "geneId" TEXT NOT NULL,
    "proteinId" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "scaffoldId" TEXT,
    "familyId" TEXT,

    CONSTRAINT "Gene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneLabel" (
    "geneId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "GeneLabel_pkey" PRIMARY KEY ("geneId","labelId")
);

-- CreateTable
CREATE TABLE "Tree" (
    "id" TEXT NOT NULL,
    "newick" TEXT NOT NULL,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GenomeSource_name_key" ON "GenomeSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GenomeState_name_key" ON "GenomeState"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Scaffold_name_speciesId_key" ON "Scaffold"("name", "speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_geneId_key" ON "Gene"("geneId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_proteinId_key" ON "Gene"("proteinId");

-- CreateIndex
CREATE UNIQUE INDEX "Family_index_key" ON "Family"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_genomeSourceId_fkey" FOREIGN KEY ("genomeSourceId") REFERENCES "GenomeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_genomeStateId_fkey" FOREIGN KEY ("genomeStateId") REFERENCES "GenomeState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scaffold" ADD CONSTRAINT "Scaffold_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES "Scaffold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES "Scaffold"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeGene" ADD CONSTRAINT "TreeGene_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeGene" ADD CONSTRAINT "TreeGene_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeSpecies" ADD CONSTRAINT "TreeSpecies_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeSpecies" ADD CONSTRAINT "TreeSpecies_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
