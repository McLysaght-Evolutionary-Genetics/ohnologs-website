/*
  Warnings:

  - A unique constraint covering the columns `[tokenId,geneId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tag_tokenId_geneId_key" ON "Tag"("tokenId", "geneId");
