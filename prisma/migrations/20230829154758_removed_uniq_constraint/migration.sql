-- DropForeignKey
ALTER TABLE "Gene" DROP CONSTRAINT "Gene_scaffoldId_segmentId_fkey";

-- DropIndex
DROP INDEX "Segment_segmentId_scaffoldId_key";

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_speciesId_scaffoldId_segmentId_fkey" FOREIGN KEY ("speciesId", "scaffoldId", "segmentId") REFERENCES "Segment"("speciesId", "scaffoldId", "segmentId") ON DELETE RESTRICT ON UPDATE CASCADE;
