-- CreateTable
CREATE TABLE "MsynBlock" (
    "id" TEXT NOT NULL,

    CONSTRAINT "MsynBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MsynGroup" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "MsynGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MsynGene" (
    "groupId" TEXT NOT NULL,
    "geneId" TEXT NOT NULL,

    CONSTRAINT "MsynGene_pkey" PRIMARY KEY ("groupId","geneId")
);

-- AddForeignKey
ALTER TABLE "MsynGroup" ADD CONSTRAINT "MsynGroup_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "MsynBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MsynGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynGene" ADD CONSTRAINT "MsynGene_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
