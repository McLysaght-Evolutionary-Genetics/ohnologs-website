-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "geneId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("geneId") ON DELETE RESTRICT ON UPDATE CASCADE;
