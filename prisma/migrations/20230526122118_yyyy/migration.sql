-- CreateEnum
CREATE TYPE "GenomeCompletnesss" AS ENUM ('chromosome', 'scaffold');

-- AlterTable
ALTER TABLE "Species" ADD COLUMN     "completness" "GenomeCompletnesss" NOT NULL DEFAULT 'chromosome';

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "scaffoldId" TEXT NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES "Scaffold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
