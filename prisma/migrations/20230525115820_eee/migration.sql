/*
  Warnings:

  - A unique constraint covering the columns `[index]` on the table `Family` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Family_index_key" ON "Family"("index");
