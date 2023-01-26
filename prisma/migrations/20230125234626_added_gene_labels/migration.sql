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

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneLabel" ADD CONSTRAINT "GeneLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
